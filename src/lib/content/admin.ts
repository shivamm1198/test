import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export type AdminRole = "president" | "coordinator";

export type AdminSession = {
  supabase: Awaited<ReturnType<typeof createClient>>;
  user: { id: string; email: string } | null;
  isAdmin: boolean;
  /** The president has everything; coordinators have every dashboard except internships and the team. */
  role: AdminRole | null;
};

/** Reads the signed-in user and whether they are listed in `public.admins`. */
export const getAdminSession = cache(async (): Promise<AdminSession> => {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;
  if (!claims) return { supabase, user: null, isAdmin: false, role: null };

  const [{ data: isAdmin }, own] = await Promise.all([
    supabase.rpc("is_admin"),
    supabase
      .from("admins")
      .select("role")
      .eq("user_id", claims.sub)
      .maybeSingle<{ role: string }>(),
  ]);
  const admin = isAdmin === true;
  // Before team-and-registry.sql is run there is no role column: every admin is the president.
  const role: AdminRole | null = !admin
    ? null
    : own.data?.role === "coordinator"
      ? "coordinator"
      : "president";
  return {
    supabase,
    user: { id: claims.sub, email: String(claims.email ?? "") },
    isAdmin: admin,
    role,
  };
});

/** For dashboard pages: redirects signed-out visitors to the login page. */
export async function requireAdminPage() {
  if (!isSupabaseConfigured) redirect("/admin/login");
  const session = await getAdminSession();
  if (!session.user) redirect("/admin/login");
  return session;
}

export type ActionResult<T = undefined> =
  ({ ok: true } & (T extends undefined ? object : { data: T })) | { ok: false; error: string };

/** For Server Actions: returns the session, or an error result to send back. */
export async function authorizeAction(): Promise<
  { ok: true; session: AdminSession } | { ok: false; error: string }
> {
  if (!isSupabaseConfigured) return { ok: false, error: "Supabase is not configured yet." };
  const session = await getAdminSession();
  if (!session.user) return { ok: false, error: "Your session has expired. Please sign in again." };
  if (!session.isAdmin) return { ok: false, error: "This account doesn't have dashboard access." };
  return { ok: true, session };
}

/** For Server Actions only the president may run (e.g. managing the team). */
export async function authorizePresident(): ReturnType<typeof authorizeAction> {
  const auth = await authorizeAction();
  if (!auth.ok) return auth;
  if (auth.session.role !== "president") {
    return { ok: false, error: "Only the president can do this." };
  }
  return auth;
}
