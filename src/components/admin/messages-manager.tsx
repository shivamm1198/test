"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  Archive,
  ArchiveRestore,
  ArrowLeft,
  Building2,
  Inbox,
  Mail,
  MailOpen,
  Phone,
  Reply,
  Search,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { topicLabel } from "@/lib/contact/topics";
import { formatDateTime } from "@/lib/portal/format";
import { archiveMessages, deleteMessages, markMessagesRead } from "@/lib/admin/message-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AdminPageHeader } from "@/components/admin/page-header";
import { ConfirmAction } from "@/components/admin/confirm-button";
import { ErrorNote } from "@/components/admin/events-manager";

export type ContactMessage = {
  id: string;
  topic: string;
  name: string;
  email: string;
  phone: string;
  organisation: string;
  message: string;
  read_at: string | null;
  archived: boolean;
  created_at: string;
};

type Box = "inbox" | "archived";

/** The president's inbox for contact-form messages. */
export function MessagesManager({
  messages,
  loadError,
}: {
  messages: ContactMessage[];
  loadError?: string;
}) {
  const router = useRouter();
  const [box, setBox] = React.useState<Box>("inbox");
  const [query, setQuery] = React.useState("");
  const [openId, setOpenId] = React.useState<string | null>(null);
  // Optimistic overrides until the server data refreshes.
  const [local, setLocal] = React.useState<Record<string, Partial<ContactMessage>>>({});

  const all = React.useMemo(
    () => messages.map((m) => ({ ...m, ...local[m.id] })),
    [messages, local],
  );
  const unread = all.filter((m) => !m.archived && !m.read_at).length;
  const q = query.trim().toLowerCase();
  const shown = all.filter(
    (m) =>
      (box === "archived" ? m.archived : !m.archived) &&
      (!q ||
        `${m.name} ${m.email} ${m.organisation} ${m.message} ${topicLabel(m.topic)}`
          .toLowerCase()
          .includes(q)),
  );
  const open = all.find((m) => m.id === openId) ?? null;

  const patch = (id: string, values: Partial<ContactMessage>) =>
    setLocal((l) => ({ ...l, [id]: { ...l[id], ...values } }));

  const openMessage = async (m: ContactMessage) => {
    setOpenId(m.id);
    if (!m.read_at) {
      patch(m.id, { read_at: new Date().toISOString() });
      const res = await markMessagesRead([m.id], true);
      if (res.ok) router.refresh();
    }
  };

  const setRead = async (m: ContactMessage, read: boolean) => {
    patch(m.id, { read_at: read ? new Date().toISOString() : null });
    const res = await markMessagesRead([m.id], read);
    if (!res.ok) return toast.error(res.error);
    if (!read) setOpenId(null);
    router.refresh();
  };

  const setArchived = async (m: ContactMessage, archived: boolean) => {
    patch(m.id, { archived });
    setOpenId(null);
    const res = await archiveMessages([m.id], archived);
    if (!res.ok) return toast.error(res.error);
    toast.success(archived ? "Moved to Archived" : "Moved back to the inbox");
    router.refresh();
  };

  const remove = async (m: ContactMessage) => {
    const res = await deleteMessages([m.id]);
    if (!res.ok) return toast.error(res.error);
    setOpenId(null);
    toast.success("Message deleted");
    router.refresh();
  };

  return (
    <>
      <AdminPageHeader
        eyebrow="Dashboard · President"
        title="Messages"
        description="Everything sent through the contact form on /contact. Only the president can see these — not coordinators or internship coordinators."
      />

      <div className="p-5 sm:p-8">
        {loadError && <ErrorNote message={loadError} />}

        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div role="tablist" className="inline-flex w-fit rounded-lg bg-muted p-1 text-sm">
            {(
              [
                ["inbox", "Inbox", unread],
                ["archived", "Archived", 0],
              ] as const
            ).map(([key, label, count]) => (
              <button
                key={key}
                type="button"
                role="tab"
                aria-selected={box === key}
                onClick={() => {
                  setBox(key);
                  setOpenId(null);
                }}
                className={cn(
                  "inline-flex items-center gap-2 rounded-md px-3.5 py-1.5 font-medium transition-colors",
                  box === key ? "bg-white text-ink shadow-sm" : "text-foreground/60 hover:text-ink",
                )}
              >
                {label}
                {count > 0 && (
                  <span className="rounded-full bg-ink px-1.5 py-0.5 text-[10px] leading-none text-white tabular-nums">
                    {count}
                  </span>
                )}
              </button>
            ))}
          </div>
          <label className="relative sm:w-80">
            <span className="sr-only">Search messages</span>
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search name, email or text"
              className="h-10 bg-white pl-9"
            />
          </label>
        </div>

        <div className="grid gap-4 lg:grid-cols-[minmax(0,380px)_minmax(0,1fr)] lg:items-start">
          {/* List */}
          <div
            className={cn("overflow-hidden rounded-xl border bg-white", open && "hidden lg:block")}
          >
            {shown.length === 0 ? (
              <div className="px-6 py-16 text-center">
                <Inbox className="mx-auto size-9 text-gold" strokeWidth={1.4} />
                <p className="mt-3 font-serif text-xl text-ink">
                  {q
                    ? "No messages match"
                    : box === "archived"
                      ? "Nothing archived"
                      : "No messages yet"}
                </p>
                {!q && box === "inbox" && (
                  <p className="mx-auto mt-1 max-w-xs text-sm text-muted-foreground">
                    Messages sent from the contact page will appear here.
                  </p>
                )}
              </div>
            ) : (
              <ul className="max-h-[70vh] divide-y overflow-y-auto">
                {shown.map((m) => {
                  const isUnread = !m.read_at && !m.archived;
                  return (
                    <li key={m.id}>
                      <button
                        type="button"
                        onClick={() => openMessage(m)}
                        aria-current={m.id === openId ? "true" : undefined}
                        className={cn(
                          "relative flex w-full flex-col gap-1 px-4 py-3.5 text-left transition-colors hover:bg-paper/70",
                          m.id === openId && "bg-paper",
                        )}
                      >
                        {m.id === openId && (
                          <span className="absolute top-2 bottom-2 left-0 w-[2px] gold-gradient" />
                        )}
                        <span className="flex items-center gap-2">
                          {isUnread && (
                            <span
                              className="size-2 shrink-0 rounded-full bg-gold"
                              aria-label="Unread"
                            />
                          )}
                          <span
                            className={cn(
                              "min-w-0 flex-1 truncate text-sm",
                              isUnread ? "font-semibold text-ink" : "text-foreground/80",
                            )}
                          >
                            {m.name}
                          </span>
                          <span className="shrink-0 text-[11px] text-muted-foreground">
                            {formatDateTime(m.created_at).replace(/, \d{4}/, "")}
                          </span>
                        </span>
                        <span className="text-[11px] font-semibold tracking-[0.12em] text-gold-dark uppercase">
                          {topicLabel(m.topic)}
                        </span>
                        <span className="line-clamp-2 text-xs text-muted-foreground">
                          {m.message}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {/* Reading pane */}
          <AnimatePresence mode="wait">
            {open ? (
              <motion.article
                key={open.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="overflow-hidden rounded-xl border bg-white"
              >
                <div className="h-[3px] gold-gradient" />
                <div className="p-5 sm:p-7">
                  <button
                    type="button"
                    onClick={() => setOpenId(null)}
                    className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-ink lg:hidden"
                  >
                    <ArrowLeft className="size-4" /> All messages
                  </button>
                  <p className="text-[11px] font-semibold tracking-[0.16em] text-gold-dark uppercase">
                    {topicLabel(open.topic)}
                  </p>
                  <h2 className="mt-1 text-3xl font-semibold text-ink">{open.name}</h2>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Received {formatDateTime(open.created_at)}
                  </p>

                  <dl className="mt-5 grid gap-2 text-sm sm:grid-cols-2">
                    <Detail Icon={Mail} label="Email">
                      <a href={`mailto:${open.email}`} className="text-ink hover:underline">
                        {open.email}
                      </a>
                    </Detail>
                    {open.phone && (
                      <Detail Icon={Phone} label="Phone">
                        <a
                          href={`tel:${open.phone.replace(/\s/g, "")}`}
                          className="text-ink hover:underline"
                        >
                          {open.phone}
                        </a>
                      </Detail>
                    )}
                    {open.organisation && (
                      <Detail Icon={Building2} label="College / Organisation">
                        <span className="text-ink">{open.organisation}</span>
                      </Detail>
                    )}
                  </dl>

                  <p className="mt-6 border-t pt-6 leading-relaxed whitespace-pre-wrap text-foreground/85">
                    {open.message}
                  </p>

                  <div className="mt-8 flex flex-wrap gap-2 border-t pt-5">
                    <Button asChild>
                      <a
                        href={`mailto:${open.email}?subject=${encodeURIComponent(
                          `Re: ${topicLabel(open.topic)}`,
                        )}&body=${encodeURIComponent(
                          `\n\n— On ${formatDateTime(open.created_at)}, ${open.name} wrote:\n${open.message
                            .split("\n")
                            .map((l) => `> ${l}`)
                            .join("\n")}`,
                        )}`}
                      >
                        <Reply /> Reply by email
                      </a>
                    </Button>
                    <Button variant="outline" onClick={() => setRead(open, !open.read_at)}>
                      {open.read_at ? <Mail /> : <MailOpen />}
                      {open.read_at ? "Mark unread" : "Mark read"}
                    </Button>
                    <Button variant="outline" onClick={() => setArchived(open, !open.archived)}>
                      {open.archived ? <ArchiveRestore /> : <Archive />}
                      {open.archived ? "Move to inbox" : "Archive"}
                    </Button>
                    <ConfirmAction
                      title="Delete this message?"
                      description={<>The message from {open.name} will be removed permanently.</>}
                      onConfirm={() => remove(open)}
                    >
                      <Button
                        variant="ghost"
                        className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                      >
                        <Trash2 /> Delete
                      </Button>
                    </ConfirmAction>
                  </div>
                </div>
              </motion.article>
            ) : (
              shown.length > 0 && (
                <div className="hidden min-h-64 place-items-center rounded-xl border border-dashed bg-white/60 text-sm text-muted-foreground lg:grid">
                  Select a message to read it.
                </div>
              )
            )}
          </AnimatePresence>
        </div>
      </div>
    </>
  );
}

function Detail({
  Icon,
  label,
  children,
}: {
  Icon: typeof Mail;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-2.5 rounded-lg bg-paper px-3 py-2.5">
      <Icon className="mt-0.5 size-4 shrink-0 text-gold" />
      <div className="min-w-0">
        <dt className="text-[11px] text-muted-foreground">{label}</dt>
        <dd className="truncate">{children}</dd>
      </div>
    </div>
  );
}
