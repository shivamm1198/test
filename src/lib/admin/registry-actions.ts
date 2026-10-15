"use server";

import { updateTag } from "next/cache";
import { z } from "zod";

import { authorizeAction, type ActionResult } from "@/lib/content/admin";
import { TAGS } from "@/lib/content/queries";
import { registeredMemberInputSchema } from "@/lib/content/schema";
import { describeIssues } from "./errors";

const MAX_IMPORT = 5000;
const CHUNK = 500;

function friendly(error: { code?: string; message: string }) {
  if (error.code === "23505") return "That member ID is already used by someone else.";
  if (error.code === "42P01") return "Run supabase/team-and-registry.sql in Supabase first.";
  return error.message;
}

/** Adds a member, or updates one when `id` is given. An empty ID is assigned automatically. */
export async function saveRegisteredMember(
  id: string | null,
  input: unknown,
): Promise<ActionResult<{ code: string }>> {
  const auth = await authorizeAction();
  if (!auth.ok) return auth;
  const parsed = registeredMemberInputSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: describeIssues(parsed.error) };

  const { name, location, member_code } = parsed.data;
  // Leaving the ID out keeps the current one (edit) or assigns the next one (new).
  const row: { name: string; location: string; member_code?: string } = { name, location };
  if (member_code) row.member_code = member_code;
  const { supabase } = auth.session;
  const query = id
    ? supabase.from("registered_members").update(row).eq("id", id)
    : supabase.from("registered_members").insert(row);
  const { data, error } = await query.select("member_code").single();
  if (error) return { ok: false, error: friendly(error) };

  updateTag(TAGS.registry);
  return { ok: true, data: { code: data.member_code } };
}

export async function deleteRegisteredMembers(
  ids: string[],
): Promise<ActionResult<{ deleted: number }>> {
  const auth = await authorizeAction();
  if (!auth.ok) return auth;
  const parsed = z.array(z.uuid()).min(1).max(MAX_IMPORT).safeParse(ids);
  if (!parsed.success) return { ok: false, error: "Pick the members to delete." };

  let deleted = 0;
  for (let i = 0; i < parsed.data.length; i += 200) {
    const { error, count } = await auth.session.supabase
      .from("registered_members")
      .delete({ count: "exact" })
      .in("id", parsed.data.slice(i, i + 200));
    if (error) {
      if (deleted) updateTag(TAGS.registry);
      return { ok: false, error: friendly(error) };
    }
    deleted += count ?? 0;
  }

  updateTag(TAGS.registry);
  return { ok: true, data: { deleted } };
}

/** Adds many members at once (from a pasted list or a CSV file). */
export async function importRegisteredMembers(
  rows: unknown,
): Promise<ActionResult<{ added: number }>> {
  const auth = await authorizeAction();
  if (!auth.ok) return auth;
  const parsed = z
    .array(registeredMemberInputSchema)
    .min(1, "There's nothing to import.")
    .max(MAX_IMPORT, `Import at most ${MAX_IMPORT} members at a time.`)
    .safeParse(rows);
  if (!parsed.success) return { ok: false, error: describeIssues(parsed.error) };

  const seen = new Set<string>();
  for (const r of parsed.data) {
    const code = r.member_code.toUpperCase();
    if (!code) continue;
    if (seen.has(code)) return { ok: false, error: `The ID ${code} appears twice in the list.` };
    seen.add(code);
  }

  let added = 0;
  for (let i = 0; i < parsed.data.length; i += CHUNK) {
    const chunk = parsed.data.slice(i, i + CHUNK).map((r) => ({
      name: r.name,
      location: r.location,
      member_code: r.member_code || null,
    }));
    const { error, count } = await auth.session.supabase
      .from("registered_members")
      .insert(chunk, { count: "exact" });
    if (error) {
      if (added) updateTag(TAGS.registry);
      const reason = friendly(error);
      return {
        ok: false,
        error: added
          ? `Added ${added} members, then stopped: ${reason} Fix the list and import the rest.`
          : reason === "That member ID is already used by someone else."
            ? "Some IDs in the list are already used by existing members."
            : reason,
      };
    }
    added += count ?? chunk.length;
  }

  updateTag(TAGS.registry);
  return { ok: true, data: { added } };
}
