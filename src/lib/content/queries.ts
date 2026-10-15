import "server-only";

import { cacheLife, cacheTag } from "next/cache";

import {
  defaultContent,
  sampleArticles,
  sampleEvents,
  sampleGallery,
  sampleRegisteredMembers,
} from "@/data/site";
import { createPublicClient } from "@/lib/supabase/public";
import { documentUrl, isSupabaseConfigured, mediaUrl } from "@/lib/supabase/env";
import { formatEventDate } from "./derive";
import {
  contentKeys,
  contentSchemas,
  type ContentKey,
  type ArticleItem,
  type EventItem,
  type GalleryItem,
  type RegisteredMember,
  type SiteContent,
} from "./schema";

/** Cache tags invalidated by the dashboards after every save. */
export const TAGS = {
  content: "content",
  events: "events",
  gallery: "gallery",
  articles: "articles",
  registry: "registered-members",
} as const;

export type ContentRow = { key: string; data: unknown; updated_at?: string };

/** Validates each stored section, falling back to the default for anything missing or invalid. */
export function mergeContent(rows: ContentRow[]): SiteContent {
  const byKey = new Map(rows.map((r) => [r.key, r.data]));
  const out = {} as Record<ContentKey, unknown>;
  for (const key of contentKeys) {
    const stored = byKey.get(key);
    const parsed = stored === undefined ? null : contentSchemas[key].safeParse(stored);
    if (parsed && !parsed.success) {
      console.warn(`[content] "${key}" in the database is invalid; using the default.`);
    }
    out[key] = parsed?.success ? parsed.data : defaultContent[key];
  }
  return out as SiteContent;
}

export async function getContent(): Promise<SiteContent> {
  "use cache";
  cacheTag(TAGS.content);
  cacheLife("minutes");

  if (!isSupabaseConfigured) return defaultContent;
  const { data, error } = await createPublicClient().from("site_content").select("key, data");
  if (error) {
    console.error("[content] Could not load site content:", error.message);
    return defaultContent;
  }
  return mergeContent(data ?? []);
}

export type EventRow = {
  id: string;
  title: string;
  location: string;
  start_date: string;
  end_date: string | null;
  description: string;
  image_url: string;
  published: boolean;
};

export function toEventItem(row: EventRow): EventItem {
  return {
    id: row.id,
    title: row.title,
    location: row.location,
    startDate: row.start_date,
    endDate: row.end_date,
    dateLabel: formatEventDate(row.start_date, row.end_date),
    description: row.description,
    image: mediaUrl(row.image_url),
    published: row.published,
  };
}

/** Published events, newest first. */
export async function getEvents(): Promise<EventItem[]> {
  "use cache";
  cacheTag(TAGS.events);
  cacheLife("minutes");

  if (!isSupabaseConfigured) return sampleEvents;
  const { data, error } = await createPublicClient()
    .from("events")
    .select("id, title, location, start_date, end_date, description, image_url, published")
    .eq("published", true)
    .order("start_date", { ascending: false });
  if (error) {
    console.error("[events] Could not load events:", error.message);
    return [];
  }
  return (data as EventRow[]).map(toEventItem);
}

export type GalleryRow = {
  id: string;
  title: string;
  category: string;
  image_url: string;
  width: number;
  height: number;
};

export function toGalleryItem(row: GalleryRow): GalleryItem {
  return {
    id: row.id,
    src: mediaUrl(row.image_url),
    title: row.title,
    category: row.category,
    w: row.width,
    h: row.height,
  };
}

/** Gallery photos, newest first. */
export async function getGallery(): Promise<GalleryItem[]> {
  "use cache";
  cacheTag(TAGS.gallery);
  cacheLife("minutes");

  if (!isSupabaseConfigured) return sampleGallery;
  const { data, error } = await createPublicClient()
    .from("gallery_items")
    .select("id, title, category, image_url, width, height")
    .order("created_at", { ascending: false });
  if (error) {
    console.error("[gallery] Could not load gallery:", error.message);
    return [];
  }
  return (data as GalleryRow[]).map(toGalleryItem);
}

export type ArticleRow = {
  id: string;
  slug: string;
  title: string;
  author_name: string;
  author_detail: string;
  category: string;
  summary: string;
  body: string;
  cover_url: string;
  document_url: string;
  document_name: string;
  published: boolean;
  published_on: string;
};

const ARTICLE_COLUMNS =
  "id, slug, title, author_name, author_detail, category, summary, body, cover_url, document_url, document_name, published, published_on";

export function toArticleItem(row: ArticleRow): ArticleItem {
  const words = row.body.trim() ? row.body.trim().split(/\s+/).length : 0;
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    author: row.author_name,
    authorDetail: row.author_detail,
    category: row.category,
    summary: row.summary,
    body: row.body,
    cover: mediaUrl(row.cover_url),
    documentUrl: documentUrl(row.document_url, row.document_name || undefined),
    documentName: row.document_name,
    date: row.published_on,
    dateLabel: formatEventDate(row.published_on),
    readingMinutes: Math.max(1, Math.round(words / 200)),
    published: row.published,
  };
}

/** Published journal articles, newest first. */
export async function getArticles(): Promise<ArticleItem[]> {
  "use cache";
  cacheTag(TAGS.articles);
  cacheLife("minutes");

  if (!isSupabaseConfigured) return sampleArticles;
  const { data, error } = await createPublicClient()
    .from("articles")
    .select(ARTICLE_COLUMNS)
    .eq("published", true)
    .order("published_on", { ascending: false })
    .order("created_at", { ascending: false });
  if (error) {
    console.error("[articles] Could not load articles:", error.message);
    return [];
  }
  return (data as ArticleRow[]).map(toArticleItem);
}

/** One published article, or null when the slug doesn't exist. */
export async function getArticle(slug: string): Promise<ArticleItem | null> {
  "use cache";
  cacheTag(TAGS.articles);
  cacheLife("minutes");

  if (!isSupabaseConfigured) return sampleArticles.find((a) => a.slug === slug) ?? null;
  const { data, error } = await createPublicClient()
    .from("articles")
    .select(ARTICLE_COLUMNS)
    .eq("slug", slug)
    .eq("published", true)
    .maybeSingle();
  if (error) {
    console.error("[articles] Could not load article:", error.message);
    return null;
  }
  return data ? toArticleItem(data as ArticleRow) : null;
}

type RegistryClient = Pick<ReturnType<typeof createPublicClient>, "from">;
export type RegisteredMemberRow = { id: string; member_code: string; name: string; location: string };

/**
 * Every registered member, ordered by ID. Supabase returns at most 1,000 rows
 * per request, so this pages through the whole list.
 */
export async function fetchRegisteredMembers(
  client: RegistryClient,
): Promise<{ members: RegisteredMember[]; error?: string }> {
  const pageSize = 1000;
  const members: RegisteredMember[] = [];
  for (let from = 0; ; from += pageSize) {
    const { data, error } = await client
      .from("registered_members")
      .select("id, member_code, name, location")
      .order("member_code")
      .range(from, from + pageSize - 1);
    if (error) return { members, error: error.message };
    const rows = (data ?? []) as RegisteredMemberRow[];
    members.push(
      ...rows.map((r) => ({ id: r.id, code: r.member_code, name: r.name, location: r.location })),
    );
    if (rows.length < pageSize) return { members };
  }
}

export async function getRegisteredMembers(): Promise<RegisteredMember[]> {
  "use cache";
  cacheTag(TAGS.registry);
  cacheLife("minutes");

  if (!isSupabaseConfigured) return sampleRegisteredMembers;
  const { members, error } = await fetchRegisteredMembers(createPublicClient());
  if (error) console.error("[registry] Could not load registered members:", error);
  return members;
}
