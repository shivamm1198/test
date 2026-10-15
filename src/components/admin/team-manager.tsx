"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Copy, Crown, Link2, Loader2, ShieldCheck, UserMinus } from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { createTeamInvite, removeCoordinator, revokeTeamInvite } from "@/lib/admin/team-actions";
import { formatDateTime } from "@/lib/portal/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AdminPageHeader } from "@/components/admin/page-header";
import { ConfirmAction } from "@/components/admin/confirm-button";
import { ErrorNote } from "@/components/admin/events-manager";

export type TeamMember = {
  user_id: string;
  email: string | null;
  role: "president" | "coordinator";
  full_name: string;
  created_at: string;
};

export type TeamInvite = {
  id: string;
  token: string;
  label: string;
  expires_at: string;
  max_uses: number | null;
  uses: number;
  revoked: boolean;
  created_at: string;
};

const selectClass =
  "h-10 w-full rounded-md border border-input bg-white px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/30";

const EXPIRY = [
  { value: "1", label: "24 hours" },
  { value: "3", label: "3 days" },
  { value: "7", label: "7 days" },
  { value: "30", label: "30 days" },
];

function inviteStatus(invite: TeamInvite, now: number) {
  if (invite.revoked) return { label: "Revoked", active: false };
  if (new Date(invite.expires_at).getTime() <= now) return { label: "Expired", active: false };
  if (invite.max_uses !== null && invite.uses >= invite.max_uses) {
    return { label: "Used", active: false };
  }
  return { label: "Active", active: true };
}

async function copy(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    toast.success("Link copied. Send it on WhatsApp or by email.");
  } catch {
    toast.error("Couldn't copy automatically. Select the link and copy it.");
  }
}

export function TeamManager({
  members,
  invites,
  currentUserId,
  origin,
  now,
  loadError,
}: {
  members: TeamMember[];
  invites: TeamInvite[];
  currentUserId: string;
  origin: string;
  now: number;
  loadError?: string;
}) {
  const router = useRouter();
  const [form, setForm] = React.useState({ label: "", expiry: "7", limit: "1" });
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [created, setCreated] = React.useState<string | null>(null);
  const linkFor = (token: string) => `${origin}/admin/join/${token}`;

  const presidents = members.filter((m) => m.role === "president");
  const coordinators = members.filter((m) => m.role === "coordinator");

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const res = await createTeamInvite({
      label: form.label,
      expires_at: new Date(Date.now() + Number(form.expiry) * 86_400_000).toISOString(),
      max_uses: form.limit ? Number(form.limit) : null,
    });
    setSaving(false);
    if (!res.ok) return setError(res.error);
    setCreated(linkFor(res.data.token));
    setForm((f) => ({ ...f, label: "" }));
    router.refresh();
  };

  const remove = async (m: TeamMember) => {
    const res = await removeCoordinator(m.user_id);
    if (!res.ok) return toast.error(res.error);
    toast.success(`${m.full_name || m.email} no longer has dashboard access`);
    router.refresh();
  };

  const revoke = async (invite: TeamInvite) => {
    const res = await revokeTeamInvite(invite.id);
    if (!res.ok) return toast.error(res.error);
    toast.success("Link revoked");
    router.refresh();
  };

  return (
    <>
      <AdminPageHeader
        eyebrow="Dashboard · President"
        title="Team"
        description="Coordinators work under the president. They can use every dashboard (homepage editor, events, gallery, journal, registered members) but not the Internship portal or this Team page."
      />
      <div className="grid gap-8 p-5 sm:p-8 xl:grid-cols-[1fr_380px] xl:items-start">
        <div className="grid gap-8">
          {loadError && <ErrorNote message={loadError} />}

          <section>
            <h2 className="mb-3 flex items-center gap-2 font-sans text-[11px] font-semibold tracking-[0.2em] text-muted-foreground uppercase">
              <Crown className="size-3.5 text-gold" /> President
            </h2>
            <ul className="grid gap-2 sm:grid-cols-2">
              {presidents.map((m) => (
                <PersonRow key={m.user_id} member={m} you={m.user_id === currentUserId} />
              ))}
            </ul>
          </section>

          <section>
            <h2 className="mb-3 flex items-center gap-2 font-sans text-[11px] font-semibold tracking-[0.2em] text-muted-foreground uppercase">
              <ShieldCheck className="size-3.5 text-gold" /> Coordinators
              <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] tabular-nums">
                {coordinators.length}
              </span>
            </h2>
            {coordinators.length === 0 ? (
              <p className="rounded-xl border border-dashed bg-white px-6 py-10 text-center text-sm text-muted-foreground">
                No coordinators yet. Create an invite link and send it to the person you want to
                appoint.
              </p>
            ) : (
              <ul className="grid gap-2 sm:grid-cols-2">
                {coordinators.map((m) => (
                  <PersonRow key={m.user_id} member={m}>
                    <ConfirmAction
                      title="Remove this coordinator?"
                      description={
                        <>
                          {m.full_name || m.email} will lose access to the dashboard straight away.
                          Their account itself isn&apos;t deleted.
                        </>
                      }
                      confirmLabel="Remove"
                      onConfirm={() => remove(m)}
                    >
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                        aria-label={`Remove ${m.full_name || m.email}`}
                      >
                        <UserMinus />
                      </Button>
                    </ConfirmAction>
                  </PersonRow>
                ))}
              </ul>
            )}
          </section>

          <section>
            <h2 className="mb-3 font-sans text-[11px] font-semibold tracking-[0.2em] text-muted-foreground uppercase">
              Invite links
            </h2>
            {invites.length === 0 ? (
              <p className="rounded-xl border border-dashed bg-white px-6 py-10 text-center text-sm text-muted-foreground">
                No invite links yet.
              </p>
            ) : (
              <ul className="grid grid-cols-1 gap-2">
                {invites.map((invite) => {
                  const s = inviteStatus(invite, now);
                  return (
                    <li
                      key={invite.id}
                      className={cn(
                        "flex flex-col gap-3 rounded-lg border bg-white px-4 py-3 sm:flex-row sm:items-center",
                        !s.active && "bg-paper/60",
                      )}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-sm font-medium text-ink">
                            {invite.label || "Coordinator link"}
                          </span>
                          <span
                            className={cn(
                              "rounded-full border px-2 py-0.5 text-[11px] font-medium",
                              s.active
                                ? "border-emerald-600/20 bg-emerald-50 text-emerald-800"
                                : "border-foreground/10 text-muted-foreground",
                            )}
                          >
                            {s.label}
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {invite.uses}
                          {invite.max_uses !== null && ` of ${invite.max_uses}`} joined ·{" "}
                          {s.label === "Expired" ? "expired" : "expires"}{" "}
                          {formatDateTime(invite.expires_at)}
                        </p>
                      </div>
                      {s.active && (
                        <div className="flex gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => copy(linkFor(invite.token))}
                          >
                            <Copy /> Copy link
                          </Button>
                          <ConfirmAction
                            title="Revoke this link?"
                            description="Nobody else will be able to join with it. Coordinators who already joined keep their access."
                            confirmLabel="Revoke"
                            onConfirm={() => revoke(invite)}
                          >
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                            >
                              Revoke
                            </Button>
                          </ConfirmAction>
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        </div>

        <form
          onSubmit={onSubmit}
          className="grid gap-4 rounded-xl border bg-white p-5 xl:sticky xl:top-6"
        >
          <div>
            <h2 className="font-serif text-xl font-semibold text-ink">Appoint a coordinator</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Create a link and send it to them. They open it, create an account (or sign in) and
              get dashboard access.
            </p>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="team-label">
              Who is it for? <span className="font-normal text-muted-foreground">· optional</span>
            </Label>
            <Input
              id="team-label"
              value={form.label}
              onChange={(e) => setForm({ ...form, label: e.target.value })}
              placeholder="e.g. Priya — events coordinator"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="team-expiry">Expires after</Label>
              <select
                id="team-expiry"
                value={form.expiry}
                onChange={(e) => setForm({ ...form, expiry: e.target.value })}
                className={selectClass}
              >
                {EXPIRY.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="team-limit">People</Label>
              <Input
                id="team-limit"
                type="number"
                min={1}
                max={100}
                value={form.limit}
                onChange={(e) => setForm({ ...form, limit: e.target.value })}
                placeholder="No limit"
              />
            </div>
          </div>
          {error && <ErrorNote message={error} />}
          <Button type="submit" disabled={saving || Boolean(loadError)}>
            {saving ? <Loader2 className="animate-spin" /> : <Link2 />}
            Create invite link
          </Button>
          <AnimatePresence>
            {created && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="rounded-lg border border-gold/40 bg-gold/5 p-3"
              >
                <p className="text-xs font-medium text-gold-dark">Link ready to share</p>
                <div className="mt-2 flex gap-2">
                  <Input
                    readOnly
                    value={created}
                    onFocus={(e) => e.target.select()}
                    className="h-9 bg-white text-xs"
                  />
                  <Button type="button" size="sm" className="h-9" onClick={() => copy(created)}>
                    <Copy /> Copy
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </form>
      </div>
    </>
  );
}

function PersonRow({
  member,
  you,
  children,
}: {
  member: TeamMember;
  you?: boolean;
  children?: React.ReactNode;
}) {
  const name = member.full_name || member.email || "Unknown";
  const initials = name
    .split(/[\s@.]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join("");
  return (
    <li className="flex items-center gap-3 rounded-lg border bg-white px-4 py-3">
      <span
        aria-hidden
        className={cn(
          "grid size-9 shrink-0 place-items-center rounded-full font-serif text-sm font-semibold",
          member.role === "president"
            ? "bg-ink text-gold-light"
            : "bg-paper text-ink ring-1 ring-border",
        )}
      >
        {initials}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-ink">
          {name}
          {you && <span className="text-muted-foreground"> (you)</span>}
        </p>
        <p className="truncate text-xs text-muted-foreground">
          {member.full_name ? member.email : `Since ${formatDateTime(member.created_at)}`}
        </p>
      </div>
      {children}
    </li>
  );
}
