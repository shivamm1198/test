"use server";

import { z } from "zod";

import { authorizePresident, type ActionResult } from "@/lib/content/admin";

const ids = z.array(z.uuid()).min(1).max(500);

async function update(
  messageIds: string[],
  values: { read_at?: string | null; archived?: boolean },
): Promise<ActionResult> {
  const auth = await authorizePresident();
  if (!auth.ok) return auth;
  const parsed = ids.safeParse(messageIds);
  if (!parsed.success) return { ok: false, error: "Pick a message first." };
  const { error } = await auth.session.supabase
    .from("contact_messages")
    .update(values)
    .in("id", parsed.data);
  return error ? { ok: false, error: error.message } : { ok: true };
}

export async function markMessagesRead(messageIds: string[], read: boolean) {
  return update(messageIds, { read_at: read ? new Date().toISOString() : null });
}

export async function archiveMessages(messageIds: string[], archived: boolean) {
  return update(
    messageIds,
    archived ? { archived, read_at: new Date().toISOString() } : { archived },
  );
}

export async function deleteMessages(messageIds: string[]): Promise<ActionResult> {
  const auth = await authorizePresident();
  if (!auth.ok) return auth;
  const parsed = ids.safeParse(messageIds);
  if (!parsed.success) return { ok: false, error: "Pick a message first." };
  const { error } = await auth.session.supabase
    .from("contact_messages")
    .delete()
    .in("id", parsed.data);
  return error ? { ok: false, error: error.message } : { ok: true };
}
