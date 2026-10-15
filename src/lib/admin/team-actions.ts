"use server";

import { randomBytes } from "node:crypto";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";

import { authorizePresident, type ActionResult } from "@/lib/content/admin";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import type { PortalAuthState } from "@/lib/portal/auth-actions";
import { describeIssues } from "./errors";

/* ---------- Managing the team (president only) ---------- */

const teamInviteSchema = z.object({
  label: z.string().trim().max(80).default(""),
  expires_at: z.iso.datetime({ offset: true, message: "Pick a valid expiry" }),
  max_uses: z.number().int().positive().max(100).nullable(),
});

export async function createTeamInvite(input: unknown): Promise<ActionResult<{ token: string }>> {
  const auth = await authorizePresident();
  if (!auth.ok) return auth;
  const parsed = teamInviteSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: describeIssues(parsed.error) };
  if (new Date(parsed.data.expires_at).getTime() <= Date.now()) {
    return { ok: false, error: "The expiry must be in the future." };
  }
  const token = randomBytes(24).toString("base64url");
  const { error } = await auth.session.supabase.from("admin_invites").insert({
    ...parsed.data,
    token,
    created_by: auth.session.user!.id,
  });
  if (error) return { ok: false, error: error.message };
  return { ok: true, data: { token } };
}

export async function revokeTeamInvite(id: string): Promise<ActionResult> {
  const auth = await authorizePresident();
  if (!auth.ok) return auth;
  const { error, count } = await auth.session.supabase
    .from("admin_invites")
    .update({ revoked: true }, { count: "exact" })
    .eq("id", id);
  if (error) return { ok: false, error: error.message };
  return count ? { ok: true } : { ok: false, error: "That link no longer exists." };
}

export async function removeCoordinator(userId: string): Promise<ActionResult> {
  const auth = await authorizePresident();
  if (!auth.ok) return auth;
  const { error, count } = await auth.session.supabase
    .from("admins")
    .delete({ count: "exact" })
    .eq("user_id", userId)
    .eq("role", "coordinator");
  if (error) return { ok: false, error: error.message };
  return count ? { ok: true } : { ok: false, error: "Only coordinators can be removed here." };
}

/* ---------- Joining from an invite link ---------- */

const credentials = z.object({
  email: z.email("Enter a valid email"),
  password: z.string().min(1, "Enter your password"),
});

const signupSchema = z.object({
  name: z.string().trim().min(2, "Enter your full name").max(120),
  email: z.email("Enter a valid email"),
  password: z.string().min(8, "Use at least 8 characters for your password"),
});

async function redeem(token: string, name: string) {
  const supabase = await createClient();
  const { error } = await supabase.rpc("redeem_admin_invite", {
    invite_token: token,
    display_name: name,
  });
  return error ? { error: error.message } : {};
}

export async function joinTeamAsCurrentUser(
  _prev: PortalAuthState,
  form: FormData,
): Promise<PortalAuthState> {
  const res = await redeem(String(form.get("token") ?? ""), String(form.get("name") ?? ""));
  if (res.error) return { error: res.error };
  redirect("/admin");
}

export async function joinTeamWithNewAccount(
  _prev: PortalAuthState,
  form: FormData,
): Promise<PortalAuthState> {
  const token = String(form.get("token") ?? "");
  const email = String(form.get("email") ?? "").trim();
  if (!isSupabaseConfigured) return { email, error: "Supabase is not configured yet." };
  const parsed = signupSchema.safeParse({
    name: form.get("name"),
    email,
    password: form.get("password"),
  });
  if (!parsed.success) return { email, error: parsed.error.issues[0].message };

  const h = await headers();
  const origin = `${h.get("x-forwarded-proto") ?? "https"}://${h.get("host")}`;
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: { full_name: parsed.data.name },
      emailRedirectTo: `${origin}/auth/callback?next=${encodeURIComponent(`/admin/join/${token}`)}`,
    },
  });
  if (error) {
    return {
      email,
      error:
        error.code === "user_already_exists"
          ? "This email already has an account — use “I already have an account”."
          : error.code === "signup_disabled"
            ? "New accounts are switched off in Supabase. Ask the president to enable sign-ups."
            : error.message,
    };
  }
  if (!data.session) {
    return {
      email,
      notice:
        "Almost there — we've emailed you a confirmation link. Open it and you'll come straight back here to finish joining.",
    };
  }
  const res = await redeem(token, parsed.data.name);
  if (res.error) return { email, error: res.error };
  redirect("/admin");
}

export async function joinTeamWithExistingAccount(
  _prev: PortalAuthState,
  form: FormData,
): Promise<PortalAuthState> {
  const token = String(form.get("token") ?? "");
  const email = String(form.get("email") ?? "").trim();
  if (!isSupabaseConfigured) return { email, error: "Supabase is not configured yet." };
  const parsed = credentials.safeParse({ email, password: form.get("password") });
  if (!parsed.success) return { email, error: parsed.error.issues[0].message };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) {
    return {
      email,
      error: error.code === "invalid_credentials" ? "Incorrect email or password." : error.message,
    };
  }
  const res = await redeem(token, String(form.get("name") ?? ""));
  if (res.error) return { email, error: res.error };
  redirect("/admin");
}

/** "Not you? Sign out" on the invite page: signs out and stays on the invite. */
export async function signOutFromTeamInvite() {
  if (isSupabaseConfigured) await (await createClient()).auth.signOut();
  const referer = (await headers()).get("referer") ?? "";
  const path = referer ? new URL(referer).pathname : "";
  redirect(path.startsWith("/admin/join/") ? path : "/admin/login");
}
