import {
  BookOpen,
  Heading,
  Info,
  Award,
  BarChart3,
  Building2,
  CalendarClock,
  Columns3,
  Crown,
  GraduationCap,
  HandCoins,
  HelpCircle,
  Megaphone,
  Medal,
  ListOrdered,
  Image as ImageIcon,
  Link2,
  Map,
  Newspaper,
  Network,
  UserRound,
  Users,
  MonitorPlay,
  type LucideIcon,
} from "lucide-react";

import { iconNames, internshipModes, type ContentKey } from "@/lib/content/schema";
import { iconLabels } from "@/components/icon-map";

const iconOptions = iconNames.map((i) => ({ value: i, label: iconLabels[i] }));

type Base = { key: string; label: string; help?: string; wide?: boolean };

export type FieldDef =
  | (Base & {
      kind: "text" | "email" | "url";
      placeholder?: string;
      transform?: (value: string) => string;
    })
  | (Base & { kind: "textarea"; rows?: number; placeholder?: string })
  | (Base & { kind: "number"; min?: number })
  | (Base & { kind: "select"; options: readonly { value: string; label: string }[] })
  | (Base & { kind: "image"; shape?: "round" | "wide" | "logo" })
  | (Base & { kind: "strings"; itemLabel: string; multiline?: boolean })
  | (Base & { kind: "group"; fields: FieldDef[] })
  | (Base & { kind: "toggle" })
  | (Base & {
      kind: "list";
      itemFields: FieldDef[];
      itemNoun: string;
      itemTitle: (item: Record<string, unknown>) => string;
      newItem: () => Record<string, unknown>;
    });

type Item = Record<string, unknown>;

export type SectionDef = {
  key: ContentKey;
  title: string;
  description: string;
  group: string;
  Icon: LucideIcon;
} & (
  | { shape: "object"; fields: FieldDef[] }
  | {
      shape: "list";
      itemFields: FieldDef[];
      itemNoun: string;
      itemTitle: (item: Item) => string;
      itemSubtitle?: (item: Item) => string;
      newItem: () => Item;
      fixed?: boolean;
    }
  | { shape: "map" }
);

const s = (v: unknown) => (typeof v === "string" ? v : "");

/** Accepts a full YouTube link and keeps just the video id. */
export function youtubeIdFrom(value: string) {
  const match = value.match(
    /(?:youtu\.be\/|youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/))([\w-]{11})/,
  );
  return match ? match[1] : value.trim();
}

export const sections: SectionDef[] = [
  {
    key: "site",
    group: "Organisation",
    title: "Organisation details",
    Icon: Building2,
    description:
      "Name, tagline and contact details. Used in the header, footer, hero, contact page and every form.",
    shape: "object",
    fields: [
      {
        kind: "image",
        key: "logo",
        label: "Logo",
        shape: "logo",
        help: "Shown in the header, footer, dashboard and browser tab. A square PNG with a transparent background works best. Leave empty to use the built-in emblem.",
        wide: true,
      },
      { kind: "text", key: "name", label: "Organisation name" },
      { kind: "text", key: "short", label: "Short name", help: "e.g. VES" },
      { kind: "text", key: "hindi", label: "Name in Hindi" },
      { kind: "number", key: "founded", label: "Year founded" },
      {
        kind: "text",
        key: "tagline",
        label: "Tagline",
        help: "Shown in the homepage hero, under the name.",
        wide: true,
      },
      {
        kind: "textarea",
        key: "description",
        label: "Short description",
        help: "Shown in the homepage hero, the footer and in search results.",
        wide: true,
      },
      {
        kind: "email",
        key: "email",
        label: "Contact email",
        help: "Contact and application forms send to this address.",
      },
      { kind: "text", key: "phone", label: "Phone" },
      { kind: "textarea", key: "address", label: "Office address", rows: 2 },
      { kind: "text", key: "hours", label: "Office hours" },
      {
        kind: "group",
        key: "socials",
        label: "Social media links",
        help: "Leave a link empty to hide that icon.",
        wide: true,
        fields: [
          { kind: "url", key: "youtube", label: "YouTube channel" },
          { kind: "url", key: "linkedin", label: "LinkedIn" },
          { kind: "url", key: "instagram", label: "Instagram" },
          { kind: "url", key: "x", label: "X (Twitter)" },
        ],
      },
    ],
  },
  {
    key: "links",
    group: "Organisation",
    title: "Forms & links",
    Icon: Link2,
    description:
      "Links to your application forms (e.g. Google Forms). Leave a link empty to send people to the contact page instead.",
    shape: "object",
    fields: [
      {
        kind: "url",
        key: "joinFormUrl",
        label: "Join VES form",
        help: "Used by every “Join VES” and “Become a member” button.",
        wide: true,
      },
      {
        kind: "url",
        key: "scholarshipFormUrl",
        label: "Scholarship application form",
        help: "Used by the “Apply for a scholarship” button. Individual scholarships can also have their own form in Programmes → Scholarships.",
        wide: true,
      },
    ],
  },
  {
    key: "donate",
    group: "Organisation",
    title: "Donate (footer)",
    Icon: HandCoins,
    description:
      "The “Donate” block at the top of the footer on every page. Add a payment link (Razorpay, Instamojo, a UPI payment page…), a UPI ID, or both.",
    shape: "object",
    fields: [
      { kind: "toggle", key: "show", label: "Show the Donate block in the footer", wide: true },
      { kind: "text", key: "title", label: "Title" },
      { kind: "text", key: "buttonLabel", label: "Button label" },
      { kind: "textarea", key: "text", label: "Text", rows: 2, wide: true },
      {
        kind: "text",
        key: "url",
        label: "Donation link",
        placeholder: "https://… or /page",
        help: "The button opens this. Leave empty to send people to the contact page.",
        wide: true,
      },
      {
        kind: "text",
        key: "upiId",
        label: "UPI ID",
        placeholder: "e.g. vidhiektasangh@okaxis",
        help: "Optional. Shown with a copy button.",
      },
      {
        kind: "textarea",
        key: "details",
        label: "Other details",
        rows: 3,
        placeholder: "e.g. bank account, 80G note",
        help: "Optional. Shown under the button in small text.",
        wide: true,
      },
    ],
  },
  {
    key: "stats",
    group: "Organisation",
    title: "Headline numbers",
    Icon: BarChart3,
    description:
      "The counters in the hero, About and Journey pages. Member and state counts are added up automatically from the members map.",
    shape: "object",
    fields: [
      { kind: "number", key: "internshipsFacilitated", label: "Internships facilitated", min: 0 },
      { kind: "number", key: "eventsHeld", label: "Events & seminars held", min: 0 },
    ],
  },
  {
    key: "stateMembers",
    group: "Organisation",
    title: "Members map",
    Icon: Map,
    description:
      "Members and chapter cities per state. Drives the interactive map on the homepage, the total member count and the number of states reached.",
    shape: "map",
  },
  {
    key: "founder",
    group: "Organisation",
    title: "Founder",
    Icon: Crown,
    description: "The founder section on the homepage and About page.",
    shape: "object",
    fields: [
      {
        kind: "image",
        key: "photo",
        label: "Portrait",
        shape: "round",
        help: "Optional. Without a photo, initials are shown.",
        wide: true,
      },
      { kind: "text", key: "name", label: "Name" },
      { kind: "text", key: "title", label: "Title" },
      { kind: "textarea", key: "quote", label: "Quote", rows: 3, wide: true },
      {
        kind: "strings",
        key: "bio",
        label: "Biography",
        itemLabel: "paragraph",
        multiline: true,
        wide: true,
      },
      {
        kind: "strings",
        key: "credentials",
        label: "Credentials",
        itemLabel: "credential",
        wide: true,
      },
    ],
  },
  {
    key: "internships",
    group: "Programmes",
    title: "Internships",
    Icon: GraduationCap,
    description:
      "Openings on the Internships page. The first three are also featured on the homepage.",
    shape: "list",
    itemNoun: "internship",
    itemTitle: (i) => s(i.title) || "Untitled internship",
    itemSubtitle: (i) => [s(i.domain), s(i.location), s(i.mode)].filter(Boolean).join(" · "),
    newItem: () => ({
      id: crypto.randomUUID(),
      title: "",
      organization: "",
      location: "",
      mode: "On-site",
      domain: "Litigation",
      duration: "",
      stipend: "",
      deadline: "",
      seats: 1,
      description: "",
      eligibility: "",
      applyUrl: "",
    }),
    itemFields: [
      { kind: "text", key: "title", label: "Title", wide: true },
      { kind: "text", key: "organization", label: "Organisation / chambers", wide: true },
      {
        kind: "text",
        key: "domain",
        label: "Domain",
        help: "Used for the filter, e.g. Litigation, Corporate, Legal Aid",
      },
      {
        kind: "select",
        key: "mode",
        label: "Mode",
        options: internshipModes.map((m) => ({ value: m, label: m })),
      },
      { kind: "text", key: "location", label: "Location" },
      { kind: "text", key: "duration", label: "Duration", placeholder: "e.g. 4 weeks" },
      { kind: "text", key: "stipend", label: "Stipend", placeholder: "e.g. ₹5,000 / month" },
      { kind: "text", key: "deadline", label: "Apply by", placeholder: "e.g. 31 Oct 2026" },
      { kind: "number", key: "seats", label: "Seats", min: 0 },
      { kind: "textarea", key: "description", label: "Description", wide: true },
      { kind: "text", key: "eligibility", label: "Eligibility", wide: true },
      {
        kind: "url",
        key: "applyUrl",
        label: "Application form link",
        help: "The “Apply now” button opens this form. Leave empty to let students apply by email.",
        wide: true,
      },
    ],
  },
  {
    key: "internshipSteps",
    group: "Programmes",
    title: "How internships work",
    Icon: ListOrdered,
    description: "The numbered steps at the top of the Internships page.",
    shape: "list",
    itemNoun: "step",
    itemTitle: (i) => s(i.title) || "Untitled step",
    newItem: () => ({ title: "", text: "" }),
    itemFields: [
      { kind: "text", key: "title", label: "Title", wide: true },
      { kind: "textarea", key: "text", label: "Text", rows: 2, wide: true },
    ],
  },
  {
    key: "internshipFaqs",
    group: "Programmes",
    title: "Internship FAQs",
    Icon: HelpCircle,
    description: "Questions and answers at the bottom of the Internships page.",
    shape: "list",
    itemNoun: "question",
    itemTitle: (i) => s(i.q) || "Untitled question",
    newItem: () => ({ q: "", a: "" }),
    itemFields: [
      { kind: "text", key: "q", label: "Question", wide: true },
      { kind: "textarea", key: "a", label: "Answer", wide: true },
    ],
  },
  {
    key: "scholarships",
    group: "Programmes",
    title: "Scholarships",
    Icon: Award,
    description: "The scholarships section on the homepage and Internships page.",
    shape: "list",
    itemNoun: "scholarship",
    itemTitle: (i) => s(i.title) || "Untitled scholarship",
    itemSubtitle: (i) => s(i.amount),
    newItem: () => ({ title: "", amount: "", text: "", deadline: "", applyUrl: "" }),
    itemFields: [
      { kind: "text", key: "title", label: "Name", wide: true },
      { kind: "text", key: "amount", label: "Amount", placeholder: "e.g. ₹25,000" },
      {
        kind: "text",
        key: "deadline",
        label: "Deadline",
        placeholder: "e.g. 30 Nov 2026 or Rolling",
      },
      { kind: "textarea", key: "text", label: "Description", rows: 2, wide: true },
      {
        kind: "url",
        key: "applyUrl",
        label: "Application form link",
        help: "Optional. Adds an “Apply” link to this scholarship.",
        wide: true,
      },
    ],
  },
  {
    key: "leadership",
    group: "Programmes",
    title: "Leadership programmes",
    Icon: Medal,
    description:
      "The leadership section on the homepage, with an apply button for each programme. Paste each programme's application form link.",
    shape: "object",
    fields: [
      { kind: "text", key: "eyebrow", label: "Small heading" },
      { kind: "text", key: "title", label: "Title", wide: true },
      { kind: "textarea", key: "description", label: "Description", rows: 3, wide: true },
      {
        kind: "list",
        key: "programmes",
        label: "Programmes",
        itemNoun: "programme",
        itemTitle: (i) => s(i.title) || "Untitled programme",
        newItem: () => ({
          icon: "award",
          title: "",
          where: "",
          text: "",
          duties: [],
          buttonLabel: "Apply now",
          url: "",
        }),
        wide: true,
        itemFields: [
          { kind: "text", key: "title", label: "Title", placeholder: "e.g. Campus Leadership" },
          { kind: "select", key: "icon", label: "Icon", options: iconOptions },
          {
            kind: "text",
            key: "where",
            label: "Where",
            placeholder: "e.g. At a District Court, a High Court or the Supreme Court",
            wide: true,
          },
          { kind: "textarea", key: "text", label: "Description", rows: 3, wide: true },
          {
            kind: "strings",
            key: "duties",
            label: "Responsibilities",
            itemLabel: "responsibility",
            wide: true,
          },
          { kind: "text", key: "buttonLabel", label: "Button label" },
          {
        kind: "text",
        key: "url",
        label: "Application form link",
        placeholder: "https://… or /page",
        help: "The apply button opens this. Leave empty to send people to the contact page.",
        wide: true,
          },
        ],
      },
    ],
  },
  {
    key: "latestUpdate",
    group: "Updates",
    title: "Latest update (hero)",
    Icon: Megaphone,
    description:
      "One line in the homepage hero about the latest thing VES did, inside or outside VES. Separate from the Inside VES news list below.",
    shape: "object",
    fields: [
      { kind: "toggle", key: "show", label: "Show the latest update in the hero", wide: true },
      { kind: "text", key: "label", label: "Tag", placeholder: "e.g. Latest" },
      { kind: "text", key: "date", label: "Date", placeholder: "e.g. 12 Oct 2026" },
      {
        kind: "text",
        key: "text",
        label: "What happened",
        help: "Keep it to one sentence.",
        wide: true,
      },
      {
        kind: "text",
        key: "url",
        label: "Link",
        placeholder: "https://… or /page",
        help: "Optional. Makes the update clickable, e.g. to an event, a news post or /gallery.",
        wide: true,
      },
    ],
  },
  {
    key: "news",
    group: "Updates",
    title: "Inside VES news",
    Icon: Newspaper,
    description: "Text-only news on the homepage. List the newest item first.",
    shape: "list",
    itemNoun: "news item",
    itemTitle: (i) => s(i.title) || "Untitled news",
    itemSubtitle: (i) => [s(i.date), s(i.category)].filter(Boolean).join(" · "),
    newItem: () => ({ date: "", category: "Announcement", title: "", text: "" }),
    itemFields: [
      { kind: "text", key: "date", label: "Date", placeholder: "e.g. 28 Sep 2026" },
      { kind: "text", key: "category", label: "Category", placeholder: "e.g. Announcement" },
      { kind: "text", key: "title", label: "Headline", wide: true },
      { kind: "textarea", key: "text", label: "Text", rows: 3, wide: true },
    ],
  },
  {
    key: "videos",
    group: "Updates",
    title: "YouTube videos",
    Icon: MonitorPlay,
    description:
      "Videos on the homepage and gallery page. The first one is shown large. The channel link is set in Organisation details.",
    shape: "list",
    itemNoun: "video",
    itemTitle: (i) => s(i.title) || "Untitled video",
    itemSubtitle: (i) => (s(i.youtubeId) ? `youtu.be/${s(i.youtubeId)}` : "No video linked yet"),
    newItem: () => ({ youtubeId: "", title: "", duration: "", image: "" }),
    itemFields: [
      { kind: "text", key: "title", label: "Title", wide: true },
      {
        kind: "text",
        key: "youtubeId",
        label: "YouTube link or ID",
        help: "Paste the video link — it plays on the site. Leave empty to link to the channel.",
        transform: youtubeIdFrom,
      },
      { kind: "text", key: "duration", label: "Duration", placeholder: "e.g. 12:48" },
      {
        kind: "image",
        key: "image",
        label: "Custom thumbnail",
        shape: "wide",
        help: "Optional. YouTube's own thumbnail is used otherwise.",
        wide: true,
      },
    ],
  },
  {
    key: "members",
    group: "People",
    title: "Members",
    Icon: Users,
    description: "The core-team carousel on the homepage. Reorder with the arrows.",
    shape: "list",
    itemNoun: "member",
    itemTitle: (i) => s(i.name) || "Unnamed member",
    itemSubtitle: (i) => [s(i.role), s(i.state)].filter(Boolean).join(" · "),
    newItem: () => ({ name: "", role: "", state: "", photo: "" }),
    itemFields: [
      { kind: "image", key: "photo", label: "Photo", shape: "round", help: "Optional", wide: true },
      { kind: "text", key: "name", label: "Name" },
      { kind: "text", key: "role", label: "Role" },
      { kind: "text", key: "state", label: "State" },
    ],
  },
  {
    key: "patrons",
    group: "People",
    title: "Patrons",
    Icon: UserRound,
    description: "The patrons section on the homepage and About page.",
    shape: "list",
    itemNoun: "patron",
    itemTitle: (i) => s(i.name) || "Unnamed patron",
    itemSubtitle: (i) => s(i.title),
    newItem: () => ({ name: "", title: "Patron", detail: "", photo: "" }),
    itemFields: [
      { kind: "image", key: "photo", label: "Photo", shape: "round", help: "Optional", wide: true },
      { kind: "text", key: "name", label: "Name", wide: true },
      { kind: "text", key: "title", label: "Title", placeholder: "e.g. Chief Patron" },
      { kind: "text", key: "detail", label: "Designation", placeholder: "e.g. Senior Advocate" },
    ],
  },
  {
    key: "pillars",
    group: "About VES",
    title: "Four pillars",
    Icon: Columns3,
    description: "The four pillars band on the homepage and About page.",
    shape: "list",
    fixed: true,
    itemNoun: "pillar",
    itemTitle: (i) => s(i.title),
    itemSubtitle: (i) => s(i.hindi),
    newItem: () => ({}),
    itemFields: [
      { kind: "text", key: "title", label: "Title" },
      { kind: "text", key: "hindi", label: "Hindi word" },
      { kind: "textarea", key: "text", label: "Text", rows: 3, wide: true },
    ],
  },
  {
    key: "wings",
    group: "About VES",
    title: "Organisation wings",
    Icon: Network,
    description: "The wings explorer on the Wings page.",
    shape: "list",
    itemNoun: "wing",
    itemTitle: (i) => s(i.name) || "Untitled wing",
    itemSubtitle: (i) => (s(i.head) ? `Head: ${s(i.head)}` : ""),
    newItem: () => ({
      key: crypto.randomUUID().slice(0, 8),
      icon: "scale",
      name: "",
      head: "",
      summary: "",
      activities: [],
      viewLabel: "View wing",
      viewUrl: "",
    }),
    itemFields: [
      { kind: "text", key: "name", label: "Wing name" },
      {
        kind: "select",
        key: "icon",
        label: "Icon",
        options: iconOptions,
      },
      { kind: "text", key: "head", label: "Wing head" },
      { kind: "textarea", key: "summary", label: "Summary", rows: 2, wide: true },
      {
        kind: "strings",
        key: "activities",
        label: "Key activities",
        itemLabel: "activity",
        wide: true,
      },
      { kind: "text", key: "viewLabel", label: "View button label", placeholder: "e.g. View wing" },
      {
        kind: "text",
        key: "viewUrl",
        label: "View button link",
        placeholder: "https://… or /page",
        help: "Where the wing's View button goes. Leave empty to hide the button.",
        wide: true,
      },
    ],
  },
  {
    key: "journey",
    group: "About VES",
    title: "Journey timeline",
    Icon: CalendarClock,
    description: "Milestones on the Journey page, oldest first.",
    shape: "list",
    itemNoun: "milestone",
    itemTitle: (i) => [s(i.year), s(i.title)].filter(Boolean).join(" — ") || "Untitled milestone",
    newItem: () => ({ year: "", title: "", text: "" }),
    itemFields: [
      { kind: "text", key: "year", label: "Year" },
      { kind: "text", key: "title", label: "Title" },
      { kind: "textarea", key: "text", label: "Text", rows: 3, wide: true },
    ],
  },
  {
    key: "images",
    group: "Website images",
    title: "Photos around the site",
    Icon: ImageIcon,
    description:
      "The About images and the small floating photos beside the members map, the About image and the founder portrait. Landscape photos look best. Remove a floating photo to hide it.",
    shape: "object",
    fields: [
      {
        kind: "group",
        key: "",
        label: "About images",
        wide: true,
        fields: [
          { kind: "image", key: "aboutSection", label: "Homepage — About section", shape: "wide" },
          { kind: "image", key: "aboutPage", label: "About page — Our story", shape: "wide" },
        ],
      },
      {
        kind: "group",
        key: "",
        label: "Floating photos around the members map (homepage hero)",
        help: "Shown on larger screens. Photos 1, 3 and 4 peek out from behind the map; photo 2 rests on its top edge.",
        wide: true,
        fields: [
          { kind: "image", key: "hero1", label: "Photo 1 · top left (large)", shape: "wide" },
          {
            kind: "image",
            key: "hero2",
            label: "Photo 2 · top right (small, in front)",
            shape: "wide",
          },
          { kind: "image", key: "hero3", label: "Photo 3 · right (medium)", shape: "wide" },
          { kind: "image", key: "hero4", label: "Photo 4 · bottom left (medium)", shape: "wide" },
        ],
      },
      {
        kind: "group",
        key: "",
        label: "Floating photos around the About image",
        wide: true,
        fields: [
          { kind: "image", key: "about1", label: "Top right", shape: "wide" },
          { kind: "image", key: "about2", label: "Bottom left", shape: "wide" },
        ],
      },
      {
        kind: "group",
        key: "",
        label: "Floating photos around the founder portrait",
        wide: true,
        fields: [
          { kind: "image", key: "founder1", label: "Left", shape: "wide" },
          { kind: "image", key: "founder2", label: "Right", shape: "wide" },
        ],
      },
    ],
  },
  {
    key: "aboutSection",
    group: "Page text",
    title: "Homepage About section",
    Icon: Info,
    description:
      "The About block on the homepage, next to the About image. The years badge is worked out from the founding year.",
    shape: "object",
    fields: [
      { kind: "text", key: "eyebrow", label: "Small heading", placeholder: "e.g. About VES" },
      {
        kind: "text",
        key: "buttonLabel",
        label: "Button label",
        help: "Links to the About page. Leave empty to hide.",
      },
      { kind: "text", key: "title", label: "Title", wide: true },
      { kind: "textarea", key: "description", label: "Description", rows: 3, wide: true },
      { kind: "text", key: "badgeText", label: "Text under the years badge", wide: true },
      {
        kind: "list",
        key: "points",
        label: "Key points",
        itemNoun: "point",
        itemTitle: (i) => s(i.title) || "Untitled point",
        newItem: () => ({ icon: "scale", title: "", text: "" }),
        wide: true,
        itemFields: [
          { kind: "text", key: "title", label: "Title" },
          { kind: "select", key: "icon", label: "Icon", options: iconOptions },
          { kind: "textarea", key: "text", label: "Text", rows: 2, wide: true },
        ],
      },
    ],
  },
  {
    key: "aboutPage",
    group: "Page text",
    title: "About page",
    Icon: BookOpen,
    description:
      "All the text on the About page. The founder, pillars, patrons and join banner come from their own sections; the photo is in Website images.",
    shape: "object",
    fields: [
      {
        kind: "group",
        key: "",
        label: "Page header",
        wide: true,
        fields: [
          { kind: "text", key: "heroEyebrow", label: "Small heading" },
          { kind: "text", key: "heroTitle", label: "Title (first line)" },
          {
            kind: "text",
            key: "heroTitleMuted",
            label: "Title (second line, in grey)",
            wide: true,
          },
          { kind: "textarea", key: "heroDescription", label: "Introduction", rows: 3, wide: true },
        ],
      },
      {
        kind: "list",
        key: "purpose",
        label: "Mission, vision & approach cards",
        itemNoun: "card",
        itemTitle: (i) => s(i.title) || "Untitled card",
        newItem: () => ({ icon: "target", title: "", text: "" }),
        wide: true,
        itemFields: [
          { kind: "text", key: "title", label: "Title" },
          { kind: "select", key: "icon", label: "Icon", options: iconOptions },
          { kind: "textarea", key: "text", label: "Text", rows: 3, wide: true },
        ],
      },
      {
        kind: "group",
        key: "",
        label: "Our story",
        wide: true,
        fields: [
          { kind: "text", key: "storyEyebrow", label: "Small heading" },
          { kind: "text", key: "storyTitle", label: "Title" },
          {
            kind: "strings",
            key: "storyParagraphs",
            label: "Story",
            itemLabel: "paragraph",
            multiline: true,
            wide: true,
          },
          {
            kind: "toggle",
            key: "showStats",
            label: "Show the headline numbers under the story",
            wide: true,
          },
        ],
      },
      {
        kind: "group",
        key: "",
        label: "What we do",
        wide: true,
        fields: [
          { kind: "text", key: "workEyebrow", label: "Small heading" },
          { kind: "text", key: "workTitle", label: "Title" },
          {
            kind: "list",
            key: "work",
            label: "Activities",
            itemNoun: "activity",
            itemTitle: (i) => s(i.title) || "Untitled activity",
            newItem: () => ({ title: "", text: "" }),
            wide: true,
            itemFields: [
              { kind: "text", key: "title", label: "Title", wide: true },
              { kind: "textarea", key: "text", label: "Text", rows: 2, wide: true },
            ],
          },
        ],
      },
    ],
  },
  {
    key: "wingsPage",
    group: "Page text",
    title: "Wings page",
    Icon: Network,
    description:
      "The Wings page header and the “How we're organised” chart. The wings themselves are edited in About VES → Organisation wings.",
    shape: "object",
    fields: [
      {
        kind: "group",
        key: "",
        label: "Page header",
        help: "Placeholders: {count} = number of wings in words (e.g. Eight), {wings} = number of wings, {states} = states & UTs with members.",
        wide: true,
        fields: [
          { kind: "text", key: "heroEyebrow", label: "Small heading" },
          { kind: "text", key: "heroTitle", label: "Title" },
          { kind: "textarea", key: "heroDescription", label: "Introduction", rows: 3, wide: true },
        ],
      },
      {
        kind: "group",
        key: "",
        label: "How we're organised",
        wide: true,
        fields: [
          { kind: "text", key: "structureEyebrow", label: "Small heading" },
          { kind: "text", key: "structureTitle", label: "Title" },
          {
            kind: "list",
            key: "tiers",
            label: "Levels (top to bottom)",
            help: "Each level is drawn a little wider than the one above. The same placeholders work here.",
            itemNoun: "level",
            itemTitle: (i) => s(i.tier) || "Untitled level",
            newItem: () => ({ count: "", tier: "", text: "" }),
            wide: true,
            itemFields: [
              { kind: "text", key: "tier", label: "Name", placeholder: "e.g. State Chapters" },
              {
                kind: "text",
                key: "count",
                label: "Label above",
                placeholder: "e.g. {states} states & UTs",
              },
              { kind: "textarea", key: "text", label: "Description", rows: 2, wide: true },
            ],
          },
        ],
      },
    ],
  },
  {
    key: "sectionText",
    group: "Page text",
    title: "Section headings & banner",
    Icon: Heading,
    description:
      "Headings for sections that appear on several pages — founder, pillars, patrons, student journal — and the “Join” banner at the bottom of pages.",
    shape: "object",
    fields: [
      {
        kind: "group",
        key: "",
        label: "Founder section",
        wide: true,
        fields: [
          { kind: "text", key: "founderEyebrow", label: "Small heading" },
          {
            kind: "text",
            key: "founderLinkLabel",
            label: "Link label",
            help: "Leave empty to hide the link.",
          },
        ],
      },
      {
        kind: "group",
        key: "",
        label: "Four pillars",
        wide: true,
        fields: [
          { kind: "text", key: "pillarsEyebrow", label: "Small heading" },
          { kind: "text", key: "pillarsTitle", label: "Title" },
          {
            kind: "textarea",
            key: "pillarsDescription",
            label: "Description",
            rows: 2,
            wide: true,
          },
        ],
      },
      {
        kind: "group",
        key: "",
        label: "Members",
        wide: true,
        fields: [
          { kind: "text", key: "membersEyebrow", label: "Small heading" },
          { kind: "text", key: "membersTitle", label: "Title" },
          {
            kind: "textarea",
            key: "membersDescription",
            label: "Description",
            rows: 2,
            wide: true,
          },
        ],
      },
      {
        kind: "group",
        key: "",
        label: "Patrons",
        wide: true,
        fields: [
          { kind: "text", key: "patronsEyebrow", label: "Small heading" },
          { kind: "text", key: "patronsTitle", label: "Title" },
          {
            kind: "textarea",
            key: "patronsDescription",
            label: "Description",
            rows: 2,
            wide: true,
          },
        ],
      },
      {
        kind: "group",
        key: "",
        label: "Internships",
        wide: true,
        fields: [
          { kind: "text", key: "internshipsEyebrow", label: "Small heading" },
          { kind: "text", key: "internshipsTitle", label: "Title" },
          {
            kind: "textarea",
            key: "internshipsDescription",
            label: "Description",
            rows: 2,
            wide: true,
          },
        ],
      },
      {
        kind: "group",
        key: "",
        label: "Scholarships",
        wide: true,
        fields: [
          { kind: "text", key: "scholarshipsEyebrow", label: "Small heading" },
          { kind: "text", key: "scholarshipsTitle", label: "Title" },
          {
            kind: "textarea",
            key: "scholarshipsDescription",
            label: "Description",
            rows: 2,
            wide: true,
          },
        ],
      },
      {
        kind: "group",
        key: "",
        label: "Gallery",
        wide: true,
        fields: [
          { kind: "text", key: "galleryEyebrow", label: "Small heading" },
          { kind: "text", key: "galleryTitle", label: "Title" },
          {
            kind: "textarea",
            key: "galleryDescription",
            label: "Description",
            rows: 2,
            wide: true,
          },
        ],
      },
      {
        kind: "group",
        key: "",
        label: "Events",
        wide: true,
        fields: [
          { kind: "text", key: "eventsEyebrow", label: "Small heading" },
          { kind: "text", key: "eventsTitle", label: "Title" },
          {
            kind: "textarea",
            key: "eventsDescription",
            label: "Description",
            rows: 2,
            wide: true,
          },
        ],
      },
      {
        kind: "group",
        key: "",
        label: "News",
        wide: true,
        fields: [
          { kind: "text", key: "newsEyebrow", label: "Small heading" },
          { kind: "text", key: "newsTitle", label: "Title" },
          {
            kind: "textarea",
            key: "newsDescription",
            label: "Description",
            rows: 2,
            wide: true,
          },
        ],
      },
      {
        kind: "group",
        key: "",
        label: "YouTube",
        wide: true,
        fields: [
          { kind: "text", key: "youtubeEyebrow", label: "Small heading" },
          { kind: "text", key: "youtubeTitle", label: "Title" },
          {
            kind: "textarea",
            key: "youtubeDescription",
            label: "Description",
            rows: 2,
            wide: true,
          },
        ],
      },
      {
        kind: "group",
        key: "",
        label: "Student journal",
        help: "Used on the homepage journal section and the /journal page.",
        wide: true,
        fields: [
          { kind: "text", key: "journalEyebrow", label: "Small heading" },
          { kind: "text", key: "journalTitle", label: "Title" },
          {
            kind: "textarea",
            key: "journalDescription",
            label: "Description",
            rows: 2,
            wide: true,
          },
        ],
      },
      {
        kind: "group",
        key: "",
        label: "Registered Members page",
        help: "The list itself is edited in the Registered members dashboard.",
        wide: true,
        fields: [
          { kind: "text", key: "registryEyebrow", label: "Small heading" },
          { kind: "text", key: "registryTitle", label: "Title" },
          {
            kind: "textarea",
            key: "registryDescription",
            label: "Description",
            rows: 2,
            wide: true,
          },
        ],
      },
      {
        kind: "group",
        key: "",
        label: "Join banner (bottom of pages)",
        wide: true,
        fields: [
          { kind: "text", key: "joinTitle", label: "Title", wide: true },
          { kind: "textarea", key: "joinText", label: "Text", rows: 2, wide: true },
          {
            kind: "text",
            key: "joinButtonLabel",
            label: "Main button",
            help: "Opens the Join form from Forms & links.",
          },
          {
            kind: "text",
            key: "joinSecondaryLabel",
            label: "Second button",
            help: "Links to the Wings page. Leave empty to hide.",
          },
        ],
      },
    ],
  },
];

export const sectionGroups = Array.from(new Set(sections.map((s) => s.group)));
