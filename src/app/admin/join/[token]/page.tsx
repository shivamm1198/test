import type { Metadata } from "next";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";

import { getAdminSession } from "@/lib/content/admin";
import { getContent } from "@/lib/content/queries";
import { formatDateTime } from "@/lib/portal/format";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import {
  joinTeamAsCurrentUser,
  joinTeamWithExistingAccount,
  joinTeamWithNewAccount,
  signOutFromTeamInvite,
} from "@/lib/admin/team-actions";
import { AuthCard } from "@/components/portal/auth-card";
import { JoinForms } from "@/components/portal/auth-forms";

export const metadata: Metadata = { title: "Join the team" };

type Site = Awaited<ReturnType<typeof getContent>>["site"];

export default async function TeamJoinPage({ params }: PageProps<"/admin/join/[token]">) {
  const { site } = await getContent();
  return (
    <Suspense
      fallback={
        <div className="grid min-h-dvh place-items-center">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <Join params={params} site={site} />
    </Suspense>
  );
}

async function Join({
  params,
  site,
}: Pick<PageProps<"/admin/join/[token]">, "params"> & { site: Site }) {
  const { token } = await params;
  if (!isSupabaseConfigured) {
    return (
      <AuthCard site={site} eyebrow="Invite link" title="Supabase isn't connected yet">
        {null}
      </AuthCard>
    );
  }
  const { supabase, user, role } = await getAdminSession();
  const { data } = await supabase.rpc("admin_invite_preview", { invite_token: token });
  const invite = ((data ?? []) as { expires_at: string; usable: boolean }[])[0];

  if (role) {
    return (
      <AuthCard
        site={site}
        eyebrow="Invite link"
        title="You're already on the team"
        description={`${user?.email} already has dashboard access.`}
      >
        <a
          href="/admin"
          className="mt-8 inline-block text-sm font-medium text-ink underline underline-offset-4"
        >
          Open the dashboard
        </a>
      </AuthCard>
    );
  }

  if (!invite || !invite.usable) {
    return (
      <AuthCard
        site={site}
        eyebrow="Invite link"
        title={invite ? "This link has expired" : "Link not found"}
        description={
          invite
            ? "Ask the president for a new invite link."
            : "Check that you copied the whole link, or ask for a new one."
        }
      >
        <a
          href="/admin/login"
          className="mt-8 inline-block text-sm font-medium text-ink underline underline-offset-4"
        >
          Already on the team? Sign in
        </a>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      site={site}
      eyebrow="You're invited"
      title="Join the VES dashboard team"
      description={
        <>
          Join as a <span className="font-medium text-ink">coordinator</span>: you&apos;ll be able
          to edit the website, events, gallery, journal and member list. This link works until{" "}
          {formatDateTime(invite.expires_at)}.
        </>
      }
    >
      <JoinForms
        token={token}
        signedInAs={user?.email ?? null}
        roleLabel="coordinator"
        actions={{
          current: joinTeamAsCurrentUser,
          create: joinTeamWithNewAccount,
          existing: joinTeamWithExistingAccount,
          signOut: signOutFromTeamInvite,
        }}
      />
    </AuthCard>
  );
}
