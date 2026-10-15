"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  Download,
  FileUp,
  Loader2,
  Pencil,
  Plus,
  Search,
  Trash2,
  Users,
} from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import type { RegisteredMember } from "@/lib/content/schema";
import {
  deleteRegisteredMembers,
  importRegisteredMembers,
  saveRegisteredMember,
} from "@/lib/admin/registry-actions";
import { parseMemberList, toCsv } from "@/lib/registry/parse";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AdminPageHeader } from "@/components/admin/page-header";
import { ConfirmAction } from "@/components/admin/confirm-button";
import { ErrorNote } from "@/components/admin/events-manager";

const PAGE_SIZE = 50;

export function RegistryManager({
  members,
  loadError,
}: {
  members: RegisteredMember[];
  loadError?: string;
}) {
  const router = useRouter();
  const [query, setQuery] = React.useState("");
  const [page, setPage] = React.useState(0);
  const [selected, setSelected] = React.useState<Set<string>>(new Set());
  const [editing, setEditing] = React.useState<RegisteredMember | "new" | null>(null);
  const [importing, setImporting] = React.useState(false);
  const [busy, setBusy] = React.useState(false);

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return members;
    return members.filter((m) => `${m.code} ${m.name} ${m.location}`.toLowerCase().includes(q));
  }, [members, query]);

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = Math.min(page, pages - 1);
  const shown = filtered.slice(current * PAGE_SIZE, (current + 1) * PAGE_SIZE);
  const allShownSelected = shown.length > 0 && shown.every((m) => selected.has(m.id));

  const toggle = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const toggleShown = () =>
    setSelected((prev) => {
      const next = new Set(prev);
      for (const m of shown) {
        if (allShownSelected) next.delete(m.id);
        else next.add(m.id);
      }
      return next;
    });

  const remove = async (ids: string[]) => {
    setBusy(true);
    const res = await deleteRegisteredMembers(ids);
    setBusy(false);
    if (!res.ok) return toast.error(res.error);
    toast.success(`Deleted ${res.data.deleted} ${res.data.deleted === 1 ? "member" : "members"}`);
    setSelected(new Set());
    router.refresh();
  };

  const exportCsv = () => {
    const blob = new Blob([toCsv(members)], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ves-registered-members-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <AdminPageHeader
        eyebrow="Dashboard"
        title="Registered members"
        description="Everyone on the Registered Members page (/registered-members). IDs are assigned automatically (VES-0001, VES-0002, …) unless you type one. Paste or upload a spreadsheet to add many at once."
        actions={
          <>
            <Button variant="outline" onClick={exportCsv} disabled={members.length === 0}>
              <Download /> Export CSV
            </Button>
            <Button variant="outline" onClick={() => setImporting(true)}>
              <FileUp /> Import list
            </Button>
            <Button onClick={() => setEditing("new")}>
              <Plus /> Add member
            </Button>
          </>
        }
      />

      <div className="p-5 sm:p-8">
        {loadError && <ErrorNote message={loadError} />}

        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            <span className="font-medium text-ink tabular-nums">
              {members.length.toLocaleString("en-IN")}
            </span>{" "}
            members
            {query && ` · ${filtered.length.toLocaleString("en-IN")} match`}
          </p>
          <label className="relative sm:w-80">
            <span className="sr-only">Search members</span>
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(0);
              }}
              placeholder="Search by name, place or ID"
              className="h-10 bg-white pl-9"
            />
          </label>
        </div>

        {selected.size > 0 && (
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-ink bg-ink px-4 py-2.5 text-sm text-white">
            <span>
              {selected.size} selected
              <button
                type="button"
                onClick={() => setSelected(new Set())}
                className="ml-3 text-white/60 underline-offset-4 hover:text-white hover:underline"
              >
                Clear
              </button>
            </span>
            <ConfirmAction
              title={`Delete ${selected.size} ${selected.size === 1 ? "member" : "members"}?`}
              description="They'll be removed from the Registered Members page. Their IDs won't be reused automatically."
              onConfirm={() => remove([...selected])}
            >
              <Button size="sm" variant="destructive" disabled={busy}>
                {busy ? <Loader2 className="animate-spin" /> : <Trash2 />} Delete selected
              </Button>
            </ConfirmAction>
          </div>
        )}

        {members.length === 0 && !loadError ? (
          <div className="rounded-xl border border-dashed bg-white px-6 py-16 text-center">
            <Users className="mx-auto size-10 text-gold" strokeWidth={1.4} />
            <h2 className="mt-4 font-serif text-2xl font-semibold text-ink">No members yet</h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
              Paste your member list from Excel or Google Sheets, or upload a CSV file. You can also
              add people one by one.
            </p>
            <div className="mt-6 flex justify-center gap-2">
              <Button variant="outline" onClick={() => setImporting(true)}>
                <FileUp /> Import list
              </Button>
              <Button onClick={() => setEditing("new")}>
                <Plus /> Add member
              </Button>
            </div>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border bg-white">
            <div className="grid grid-cols-[2rem_7rem_1fr_auto] items-center gap-3 border-b bg-paper px-4 py-2.5 text-[11px] font-semibold tracking-[0.16em] text-muted-foreground uppercase sm:grid-cols-[2rem_8rem_1fr_1fr_auto]">
              <input
                type="checkbox"
                checked={allShownSelected}
                onChange={toggleShown}
                aria-label="Select all on this page"
                className="size-4 accent-ink"
              />
              <span>ID</span>
              <span>Name</span>
              <span className="hidden sm:block">Location</span>
              <span className="w-16" />
            </div>
            {shown.length === 0 ? (
              <p className="px-5 py-12 text-center text-sm text-muted-foreground">
                No members match “{query}”.
              </p>
            ) : (
              <ul className="divide-y">
                {shown.map((m) => (
                  <li
                    key={m.id}
                    className={cn(
                      "grid grid-cols-[2rem_7rem_1fr_auto] items-center gap-3 px-4 py-2.5 text-sm sm:grid-cols-[2rem_8rem_1fr_1fr_auto]",
                      selected.has(m.id) && "bg-gold/5",
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={selected.has(m.id)}
                      onChange={() => toggle(m.id)}
                      aria-label={`Select ${m.name}`}
                      className="size-4 accent-ink"
                    />
                    <span className="truncate font-mono text-xs text-gold-dark">{m.code}</span>
                    <span className="min-w-0">
                      <span className="block truncate font-medium text-ink">{m.name}</span>
                      <span className="block truncate text-xs text-muted-foreground sm:hidden">
                        {m.location}
                      </span>
                    </span>
                    <span className="hidden truncate text-muted-foreground sm:block">
                      {m.location || "—"}
                    </span>
                    <span className="flex w-16 justify-end gap-0.5">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => setEditing(m)}
                        aria-label={`Edit ${m.name}`}
                      >
                        <Pencil />
                      </Button>
                      <ConfirmAction
                        title="Delete this member?"
                        description={
                          <>
                            {m.name} ({m.code}) will be removed from the Registered Members page.
                          </>
                        }
                        onConfirm={() => remove([m.id])}
                      >
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                          aria-label={`Delete ${m.name}`}
                        >
                          <Trash2 />
                        </Button>
                      </ConfirmAction>
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {pages > 1 && (
          <nav aria-label="Pages" className="mt-4 flex items-center justify-between gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(current - 1)}
              disabled={current === 0}
            >
              <ChevronLeft /> Previous
            </Button>
            <span className="text-sm text-muted-foreground tabular-nums">
              Page {current + 1} of {pages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(current + 1)}
              disabled={current >= pages - 1}
            >
              Next <ChevronRight />
            </Button>
          </nav>
        )}
      </div>

      <Dialog open={editing !== null} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent>
          {editing !== null && (
            <MemberForm
              key={editing === "new" ? "new" : editing.id}
              member={editing === "new" ? null : editing}
              onDone={() => {
                setEditing(null);
                router.refresh();
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={importing} onOpenChange={setImporting}>
        <DialogContent className="sm:max-w-2xl">
          {importing && (
            <ImportForm
              onDone={() => {
                setImporting(false);
                router.refresh();
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

function MemberForm({ member, onDone }: { member: RegisteredMember | null; onDone: () => void }) {
  const [form, setForm] = React.useState({
    name: member?.name ?? "",
    location: member?.location ?? "",
    member_code: member?.code ?? "",
  });
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const res = await saveRegisteredMember(member?.id ?? null, form);
    setSaving(false);
    if (!res.ok) return setError(res.error);
    toast.success(member ? "Member updated" : `Added ${form.name} as ${res.data.code}`);
    onDone();
  };

  return (
    <form onSubmit={onSubmit} className="grid gap-5">
      <DialogHeader>
        <DialogTitle className="font-serif text-2xl">
          {member ? "Edit member" : "Add a member"}
        </DialogTitle>
        <DialogDescription>Shown on the public Registered Members page.</DialogDescription>
      </DialogHeader>
      <div className="grid gap-2">
        <Label htmlFor="member-name">Full name</Label>
        <Input
          id="member-name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
          autoFocus
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="member-location">
          Location <span className="font-normal text-muted-foreground">· optional</span>
        </Label>
        <Input
          id="member-location"
          value={form.location}
          onChange={(e) => setForm({ ...form, location: e.target.value })}
          placeholder="e.g. Lucknow, Uttar Pradesh"
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="member-code">Member ID</Label>
        <Input
          id="member-code"
          value={form.member_code}
          onChange={(e) => setForm({ ...form, member_code: e.target.value })}
          placeholder={member ? "" : "Leave empty to assign the next ID automatically"}
          className="font-mono"
        />
      </div>
      {error && <ErrorNote message={error} />}
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onDone} disabled={saving}>
          Cancel
        </Button>
        <Button type="submit" disabled={saving}>
          {saving && <Loader2 className="animate-spin" />}
          {member ? "Save changes" : "Add member"}
        </Button>
      </DialogFooter>
    </form>
  );
}

function ImportForm({ onDone }: { onDone: () => void }) {
  const [text, setText] = React.useState("");
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const parsed = React.useMemo(() => parseMemberList(text), [text]);
  const withId = parsed.rows.filter((r) => r.member_code).length;

  const readFile = async (file: File | undefined) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) return setError("That file is too large (5 MB max).");
    setText(await file.text());
    setError(null);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const res = await importRegisteredMembers(parsed.rows);
    setSaving(false);
    if (!res.ok) return setError(res.error);
    toast.success(`Added ${res.data.added.toLocaleString("en-IN")} members`);
    onDone();
  };

  return (
    <form onSubmit={onSubmit} className="grid gap-5">
      <DialogHeader>
        <DialogTitle className="font-serif text-2xl">Import members</DialogTitle>
        <DialogDescription>
          Copy the rows from Excel or Google Sheets and paste them here, or upload a CSV file. One
          member per line: <strong>Name, Location, ID</strong>. Location and ID are optional;
          members without an ID get the next one automatically. A header row like “Name, Location,
          ID” is fine.
        </DialogDescription>
      </DialogHeader>
      <Textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={10}
        placeholder={
          "Aarav Sharma, New Delhi\nAnanya Iyer, Chennai, Tamil Nadu, VES-0042\nOm Prakash"
        }
        className="font-mono text-xs"
        aria-label="Member list"
      />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <label className="inline-flex cursor-pointer items-center gap-2 text-sm font-medium text-ink underline-offset-4 hover:underline">
          <FileUp className="size-4 text-gold-dark" /> Upload a CSV file
          <input
            type="file"
            accept=".csv,.txt,text/csv,text/plain"
            className="sr-only"
            onChange={(e) => {
              void readFile(e.target.files?.[0]);
              e.target.value = "";
            }}
          />
        </label>
        {text.trim() && (
          <p className="text-sm text-muted-foreground">
            <span className="font-medium text-ink">
              {parsed.rows.length.toLocaleString("en-IN")}
            </span>{" "}
            members found
            {withId > 0 && ` · ${withId} with their own ID`}
            {parsed.skipped.length > 0 && ` · ${parsed.skipped.length} lines skipped (no name)`}
          </p>
        )}
      </div>
      {parsed.rows.length > 0 && (
        <div className="overflow-hidden rounded-lg border">
          <p className="border-b bg-paper px-3 py-2 text-[11px] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
            Preview
          </p>
          <ul className="divide-y text-sm">
            {parsed.rows.slice(0, 5).map((r, i) => (
              <li key={i} className="grid grid-cols-[6.5rem_1fr_1fr] gap-3 px-3 py-2">
                <span className="truncate font-mono text-xs text-gold-dark">
                  {r.member_code || "auto"}
                </span>
                <span className="truncate font-medium text-ink">{r.name}</span>
                <span className="truncate text-muted-foreground">{r.location || "—"}</span>
              </li>
            ))}
          </ul>
          {parsed.rows.length > 5 && (
            <p className="border-t px-3 py-2 text-xs text-muted-foreground">
              …and {(parsed.rows.length - 5).toLocaleString("en-IN")} more
            </p>
          )}
        </div>
      )}
      {error && <ErrorNote message={error} />}
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onDone} disabled={saving}>
          Cancel
        </Button>
        <Button type="submit" disabled={saving || parsed.rows.length === 0}>
          {saving && <Loader2 className="animate-spin" />}
          {saving
            ? "Importing…"
            : `Import ${parsed.rows.length ? parsed.rows.length.toLocaleString("en-IN") + " " : ""}members`}
        </Button>
      </DialogFooter>
    </form>
  );
}
