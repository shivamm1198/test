import type { Metadata } from "next";
import { headers } from "next/headers";
import { ShieldAlert } from "lucide-react";

import { getAdminSession } from "@/lib/content/admin";
import { requestTime } from "@/lib/portal/session";
import { AdminPageHeader } from "@/components/admin/page-header";
import { TeamManager, type TeamInvite, type TeamMember } from "@/components/admin/team-manager";

export const metadata: Metadata = { title: "Team" };

export default async function TeamPage() {
  const { supabase, role, user } = await getAdminSession();
  if (role !== "president") {
    return (
      <>
        <AdminPageHeader eyebrow="Dashboard" title="Team" />
        <div className="p-5 sm:p-8">
          <div className="flex max-w-xl items-start gap-3 rounded-xl border bg-white p-6 text-sm text-muted-foreground">
            <ShieldAlert className="size-5 shrink-0 text-gold" />
            Only the president can appoint or remove coordinators.
          </div>
        </div>
      </>
    );
  }

  const [members, invites] = await Promise.all([
    supabase
      .from("admins")
      .select("user_id, email, role, full_name, created_at")
      .order("created_at"),
    supabase
      .from("admin_invites")
      .select("id, token, label, expires_at, max_uses, uses, revoked, created_at")
      .order("created_at", { ascending: false }),
  ]);

  const now = await requestTime();
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");

  const error = members.error ?? invites.error;
  return (
    <TeamManager
      members={(members.data ?? []) as TeamMember[]}
      invites={(invites.data ?? []) as TeamInvite[]}
      currentUserId={user!.id}
      origin={`${proto}://${host}`}
      now={now}
      loadError={
        error
          ? "The team tables aren't set up yet. Run supabase/team-and-registry.sql in the Supabase SQL Editor."
          : undefined
      }
    />
  );
}
