import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";
import { connection } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import type { Access, ProgramRole } from "./types";

export type PortalSession = {
  supabase: Awaited<ReturnType<typeof createClient>>;
  user: { id: string; email: string };
  isPresident: boolean;
  memberships: { program_id: string; role: ProgramRole; full_name: string }[];
};

/** The signed-in portal user, their president status and programme memberships. */
export const getPortalSession = cache(async (): Promise<PortalSession | null> => {
  if (!isSupabaseConfigured) return null;
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;
  if (!claims) return null;

  const [president, members] = await Promise.all([
    // Dashboard coordinators are admins but not presidents, so they get no portal access.
    supabase.rpc("is_president").then((r) => (r.error ? supabase.rpc("is_admin") : r)), // before team-and-registry.sql
    supabase
      .from("internship_members")
      .select("program_id, role, full_name")
      .eq("user_id", claims.sub),
  ]);

  return {
    supabase,
    user: { id: claims.sub, email: String(claims.email ?? "") },
    isPresident: president.data === true,
    memberships: (members.data ?? []) as PortalSession["memberships"],
  };
});

/** For portal pages: signed-out visitors go to the portal login. */
export async function requirePortalSession() {
  const session = await getPortalSession();
  if (!session) redirect("/portal/login");
  return session;
}

export function accessTo(session: PortalSession, programId: string): Access | null {
  if (session.isPresident) return "president";
  return session.memberships.find((m) => m.program_id === programId)?.role ?? null;
}

export const canManage = (access: Access | null) => access === "president" || access === "admin";

/** The time of this request, used to work out deadlines and progress. */
export async function requestTime() {
  await connection();
  return Date.now();
}
