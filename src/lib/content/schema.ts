import { z } from "zod";

/**
 * Validation for every section of editable site content. The same schemas
 * guard dashboard saves and reads from the database, so a malformed row
 * can never break the public site (it falls back to the default instead).
 */

const str = z.string().trim();
const optionalStr = z.string().trim().default("");
/** Empty, or a full web link (e.g. a Google Form). */
const optionalUrl = z
  .string()
  .trim()
  .refine(
    (v) => v === "" || /^https?:\/\/\S+$/i.test(v),
    "Enter a full link starting with https://",
  )
  .default("");
const strList = z.array(z.string().trim().min(1));
/** Empty, a page on this site ("/gallery") or a full web link. */
const optionalLink = z
  .string()
  .trim()
  .refine(
    (v) => v === "" || /^https?:\/\/\S+$/i.test(v) || /^\/(?!\/)\S*$/.test(v),
    "Enter a full link starting with https://, or a page on this site like /gallery",
  )
  .default("");

export const siteSchema = z.object({
  name: str.min(1, "Name is required"),
  short: str.min(1),
  logo: optionalStr,
  hindi: optionalStr,
  tagline: optionalStr,
  description: optionalStr,
  founded: z.number().int().min(1900).max(2100),
  email: z.email("Enter a valid email"),
  phone: optionalStr,
  address: optionalStr,
  hours: optionalStr,
  socials: z.object({
    youtube: optionalStr,
    linkedin: optionalStr,
    instagram: optionalStr,
    x: optionalStr,
  }),
});

export const linksSchema = z.object({
  joinFormUrl: optionalUrl,
  scholarshipFormUrl: optionalUrl,
});

export const statsSchema = z.object({
  internshipsFacilitated: z.number().int().min(0),
  eventsHeld: z.number().int().min(0),
});

export const stateMembersSchema = z.record(
  z.string(),
  z.object({ members: z.number().int().min(0), cities: strList }),
);

export const founderSchema = z.object({
  name: str.min(1, "Name is required"),
  title: optionalStr,
  photo: optionalStr,
  quote: optionalStr,
  bio: strList,
  credentials: strList,
});

export const pillarKeys = ["integrity", "unity", "justice", "empowerment"] as const;

export const pillarsSchema = z
  .array(
    z.object({
      key: z.enum(pillarKeys),
      title: str.min(1),
      hindi: optionalStr,
      text: optionalStr,
    }),
  )
  .length(4);

export const internshipModes = ["On-site", "Hybrid", "Remote"] as const;

export const internshipSchema = z.object({
  id: str.min(1),
  title: str.min(1, "Title is required"),
  organization: optionalStr,
  location: optionalStr,
  mode: z.enum(internshipModes),
  domain: str.min(1, "Domain is required"),
  duration: optionalStr,
  stipend: optionalStr,
  deadline: optionalStr,
  seats: z.number().int().min(0),
  description: optionalStr,
  eligibility: optionalStr,
  applyUrl: optionalUrl,
});

export const internshipsSchema = z.array(internshipSchema);

export const internshipStepsSchema = z.array(z.object({ title: str.min(1), text: optionalStr }));

export const internshipFaqsSchema = z.array(z.object({ q: str.min(1), a: optionalStr }));

export const scholarshipsSchema = z.array(
  z.object({
    title: str.min(1),
    amount: optionalStr,
    text: optionalStr,
    deadline: optionalStr,
    applyUrl: optionalUrl,
  }),
);

export const newsSchema = z.array(
  z.object({ date: optionalStr, category: optionalStr, title: str.min(1), text: optionalStr }),
);

export const membersSchema = z.array(
  z.object({ name: str.min(1), role: optionalStr, state: optionalStr, photo: optionalStr }),
);

export const patronsSchema = z.array(
  z.object({ name: str.min(1), title: optionalStr, detail: optionalStr, photo: optionalStr }),
);

export const videosSchema = z.array(
  z.object({
    youtubeId: optionalStr,
    title: str.min(1),
    duration: optionalStr,
    image: optionalStr,
  }),
);

export const wingIcons = [
  "briefcase",
  "hand-heart",
  "gavel",
  "book",
  "venus",
  "graduation-cap",
  "calendar",
  "megaphone",
  "scale",
  "users",
  "target",
  "eye",
  "compass",
  "landmark",
  "handshake",
  "award",
  "sparkles",
] as const;

/** Icons editors can pick for points and cards across the site. */
export const iconNames = wingIcons;
export type IconName = (typeof iconNames)[number];

const iconCard = z.object({ icon: z.enum(iconNames), title: str.min(1), text: optionalStr });
const titledText = z.object({ title: str.min(1), text: optionalStr });

export const aboutSectionSchema = z.object({
  eyebrow: optionalStr,
  title: str.min(1),
  description: optionalStr,
  badgeText: optionalStr,
  points: z.array(iconCard),
  buttonLabel: optionalStr,
});

export const aboutPageSchema = z.object({
  heroEyebrow: optionalStr,
  heroTitle: str.min(1),
  heroTitleMuted: optionalStr,
  heroDescription: optionalStr,
  purpose: z.array(iconCard),
  storyEyebrow: optionalStr,
  storyTitle: optionalStr,
  storyParagraphs: strList,
  showStats: z.boolean().default(true),
  workEyebrow: optionalStr,
  workTitle: optionalStr,
  work: z.array(titledText),
});

/** Headings of sections shared between pages (homepage, About, Journal …). */
export const sectionTextSchema = z.object({
  founderEyebrow: optionalStr,
  founderLinkLabel: optionalStr,

  pillarsEyebrow: optionalStr,
  pillarsTitle: optionalStr,
  pillarsDescription: optionalStr,

  membersEyebrow: optionalStr,
  membersTitle: optionalStr,
  membersDescription: optionalStr,

  patronsEyebrow: optionalStr,
  patronsTitle: optionalStr,
  patronsDescription: optionalStr,

  internshipsEyebrow: optionalStr,
  internshipsTitle: optionalStr,
  internshipsDescription: optionalStr,

  scholarshipsEyebrow: optionalStr,
  scholarshipsTitle: optionalStr,
  scholarshipsDescription: optionalStr,

  galleryEyebrow: optionalStr,
  galleryTitle: optionalStr,
  galleryDescription: optionalStr,

  eventsEyebrow: optionalStr,
  eventsTitle: optionalStr,
  eventsDescription: optionalStr,

  newsEyebrow: optionalStr,
  newsTitle: optionalStr,
  newsDescription: optionalStr,

  youtubeEyebrow: optionalStr,
  youtubeTitle: optionalStr,
  youtubeDescription: optionalStr,

  journalEyebrow: optionalStr,
  journalTitle: optionalStr,
  journalDescription: optionalStr,

  registryEyebrow: optionalStr,
  registryTitle: optionalStr,
  registryDescription: optionalStr,

  joinTitle: optionalStr,
  joinText: optionalStr,
  joinButtonLabel: optionalStr,
  joinSecondaryLabel: optionalStr,
});

export const wingsPageSchema = z.object({
  heroEyebrow: optionalStr,
  heroTitle: str.min(1),
  heroDescription: optionalStr,
  structureEyebrow: optionalStr,
  structureTitle: optionalStr,
  tiers: z.array(z.object({ count: optionalStr, tier: str.min(1), text: optionalStr })),
});

export const wingsSchema = z.array(
  z.object({
    key: str.min(1),
    icon: z.enum(wingIcons),
    name: str.min(1),
    head: optionalStr,
    summary: optionalStr,
    activities: strList,
    viewLabel: optionalStr,
    viewUrl: optionalLink,
  }),
);

export const journeySchema = z.array(
  z.object({ year: str.min(1), title: str.min(1), text: optionalStr }),
);

/** Every editable section, keyed by its row key in `site_content`. */
/** Editable photos around the site; an empty floating slot is simply hidden. */
export const imagesSchema = z.object({
  aboutSection: optionalStr,
  aboutPage: optionalStr,
  hero1: optionalStr,
  hero2: optionalStr,
  hero3: optionalStr,
  hero4: optionalStr,
  about1: optionalStr,
  about2: optionalStr,
  founder1: optionalStr,
  founder2: optionalStr,
});

/** The Campus and Court Leadership programmes on the homepage. */
export const leadershipSchema = z.object({
  eyebrow: optionalStr,
  title: optionalStr,
  description: optionalStr,
  programmes: z.array(
    z.object({
      icon: z.enum(iconNames),
      title: str.min(1, "Title is required"),
      where: optionalStr,
      text: optionalStr,
      duties: strList,
      buttonLabel: optionalStr,
      url: optionalLink,
    }),
  ),
});

/** The single "what VES did latest" line in the homepage hero. */
export const latestUpdateSchema = z.object({
  show: z.boolean().default(true),
  label: optionalStr,
  text: optionalStr,
  date: optionalStr,
  url: optionalLink,
});

/** The "Donate" block in the footer. */
export const donateSchema = z.object({
  show: z.boolean().default(true),
  title: optionalStr,
  text: optionalStr,
  buttonLabel: optionalStr,
  url: optionalLink,
  upiId: optionalStr,
  details: optionalStr,
});

export const contentSchemas = {
  site: siteSchema,
  links: linksSchema,
  stats: statsSchema,
  stateMembers: stateMembersSchema,
  founder: founderSchema,
  pillars: pillarsSchema,
  internships: internshipsSchema,
  internshipSteps: internshipStepsSchema,
  internshipFaqs: internshipFaqsSchema,
  scholarships: scholarshipsSchema,
  news: newsSchema,
  members: membersSchema,
  patrons: patronsSchema,
  videos: videosSchema,
  wings: wingsSchema,
  journey: journeySchema,
  images: imagesSchema,
  aboutSection: aboutSectionSchema,
  aboutPage: aboutPageSchema,
  wingsPage: wingsPageSchema,
  sectionText: sectionTextSchema,
  leadership: leadershipSchema,
  latestUpdate: latestUpdateSchema,
  donate: donateSchema,
} as const;

export type ContentKey = keyof typeof contentSchemas;
export const contentKeys = Object.keys(contentSchemas) as ContentKey[];

export type SiteContent = { [K in ContentKey]: z.infer<(typeof contentSchemas)[K]> };

export type Site = SiteContent["site"];
export type Links = SiteContent["links"];
export type SiteImages = SiteContent["images"];
export type SectionText = SiteContent["sectionText"];
export type Leadership = SiteContent["leadership"];
export type LatestUpdate = SiteContent["latestUpdate"];
export type Donate = SiteContent["donate"];
export type Founder = SiteContent["founder"];
export type Pillar = SiteContent["pillars"][number];
export type Internship = SiteContent["internships"][number];
export type Scholarship = SiteContent["scholarships"][number];
export type Member = SiteContent["members"][number];
export type Patron = SiteContent["patrons"][number];
export type Video = SiteContent["videos"][number];
export type Wing = SiteContent["wings"][number];
export type JourneyItem = SiteContent["journey"][number];

/* Events and gallery live in their own tables. */

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use a valid date");

export const eventInputSchema = z
  .object({
    title: str.min(1, "Title is required").max(200),
    location: optionalStr,
    start_date: isoDate,
    end_date: z.union([isoDate, z.literal("")]).default(""),
    description: optionalStr,
    image_url: str.min(1, "Add an image"),
    published: z.boolean().default(true),
  })
  .refine((e) => !e.end_date || e.end_date >= e.start_date, {
    message: "End date can't be before the start date",
    path: ["end_date"],
  });

export type EventInput = z.infer<typeof eventInputSchema>;

export const galleryInputSchema = z.object({
  title: str.min(1, "Add a caption").max(200),
  category: str.min(1, "Pick a category").max(60),
  image_url: str.min(1),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
});

export type GalleryInput = z.infer<typeof galleryInputSchema>;

/** An event as shown on the public site. */
export type EventItem = {
  id: string;
  title: string;
  location: string;
  startDate: string;
  endDate: string | null;
  dateLabel: string;
  description: string;
  image: string;
  published: boolean;
};

/** A gallery photo as shown on the public site. */
export type GalleryItem = {
  id: string;
  src: string;
  title: string;
  category: string;
  w: number;
  h: number;
};

export const articleInputSchema = z.object({
  title: str.min(1, "Title is required").max(250),
  author_name: optionalStr,
  author_detail: optionalStr,
  category: optionalStr,
  summary: optionalStr,
  body: optionalStr,
  cover_url: optionalStr,
  document_url: optionalStr,
  document_name: optionalStr,
  published: z.boolean().default(true),
  published_on: isoDate,
});

export type ArticleInput = z.infer<typeof articleInputSchema>;

/** A Student Journal article as shown on the public site. */
export type ArticleItem = {
  id: string;
  slug: string;
  title: string;
  author: string;
  authorDetail: string;
  category: string;
  summary: string;
  body: string;
  cover: string;
  documentUrl: string;
  documentName: string;
  date: string;
  dateLabel: string;
  readingMinutes: number;
  published: boolean;
};

export const registeredMemberInputSchema = z.object({
  name: str.min(1, "Enter a name").max(200),
  location: str.max(200).default(""),
  member_code: str.max(40).default(""),
});

export type RegisteredMemberInput = z.infer<typeof registeredMemberInputSchema>;

/** One person in the Registered Members list. */
export type RegisteredMember = { id: string; code: string; name: string; location: string };
