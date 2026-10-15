# Vidhi Ekta Sngh (VES) — website

The website for **Vidhi Ekta Sngh (विधि एकता संघ)**, a national community that helps law students and
legal professionals with internships, scholarships, mentorship and events.

Built with **Next.js 16 (App Router)**, **Tailwind CSS v4**, **shadcn/ui** (Radix primitives) and
**Framer Motion**. The theme is light only: black and white, with a few gold accents.

## Pages

| Route                 | Contents                                                                                                                                                                          |
| --------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/`                   | Hero with an interactive India map of members, About, Founder, Internships, Scholarships, Gallery, Events, Inside VES news, Members carousel (32), Four Pillars, Patrons, YouTube |
| `/internships`        | How it works, a filterable and searchable list of openings with an apply dialog, Scholarships, FAQs                                                                               |
| `/gallery`            | Category filters, masonry grid, lightbox (keyboard ← →), events, videos                                                                                                           |
| `/journey`            | Timeline from 2020 to today with a scroll-linked gold progress rail                                                                                                               |
| `/wings`              | Interactive explorer for the 8 wings and an org-structure diagram                                                                                                                 |
| `/about`              | Mission, vision, story, founder, what we do, pillars, patrons                                                                                                                     |
| `/contact`            | Validated contact form (`/contact?subject=membership` preselects a topic) and contact details                                                                                     |
| `/registered-members` | Every registered member across India (name, location, member ID), searchable, 50 per page                                                                                         |
| `/journal`            | Student Journal articles, each with its own page and attached paper                                                                                                               |

## Getting started

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # production build
npm run lint
npm run format
```

## Editing content: the president's dashboards

All content is editable at **`/admin`** (Supabase login required):

| Dashboard          | Route             | Manages                                                                                                                                              |
| ------------------ | ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| Homepage editor    | `/admin/content`  | Organisation details, numbers, members map, founder, internships, steps, FAQs, scholarships, news, videos, members, patrons, pillars, wings, journey |
| Events             | `/admin/events`   | Create, edit, hide and delete events with a cover photo                                                                                              |
| Gallery            | `/admin/gallery`  | Bulk upload, caption, categorise and delete photos                                                                                                   |
| Student Journal    | `/admin/journal`  | Student articles with attached PDF/Word papers, shown on the homepage and `/journal`                                                                 |
| Registered members | `/admin/registry` | The `/registered-members` list: add, edit, delete, import from a spreadsheet, export CSV                                                             |
| Team               | `/admin/team`     | President only: appoint and remove coordinators (every dashboard except the Internship portal)                                                       |

## Internship portal

**`/portal`** is a separate dashboard for running internships, with three kinds of account:

- **President** (the admin login): creates internships and appoints a coordinator for each.
- **Coordinator** (internship admin): joins through a coordinator invite link. Invites interns with
  expiring links, assigns tasks with deadlines, reviews work, returns it for changes and follows each
  intern's progress.
- **Intern**: joins through an intern invite link. Sees "X of Y completed · Z remaining", writes in a
  Medium-style editor and/or uploads files, completes tasks, and gets a performance report when the
  internship ends.

Coordinators and interns can only reach the portal. See **Step 10** of
[SUPABASE_SETUP.md](SUPABASE_SETUP.md) for the full walkthrough.

**➡️ Follow [SUPABASE_SETUP.md](SUPABASE_SETUP.md)** to create the Supabase project, run the SQL in
[`supabase/`](supabase/), create the president's login and connect the keys.

- `src/data/site.ts` holds the **default content**. It pre-fills the editor, fills in any section not yet
  saved, and powers the whole site when Supabase isn't configured (handy for local development).
- Saved content lives in Supabase (`site_content`, `events`, `gallery_items` tables and the `media` bucket).
  Every section is validated with zod (`src/lib/content/schema.ts`) when saved and when read.
- Uploaded portraits (founder, members, patrons) replace the monograms automatically.
- `public/images` holds generated placeholder artwork used by the sample content (`npm run generate:images`).

## Environment variables

Copy `.env.example` to `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_…
```

## Forms

There is no backend yet. The contact and internship-application forms validate their input and then open
the visitor's mail app with a pre-filled email to `site.email`. To store submissions instead, connect them to
a route handler or a form service.

## Structure

```
src/
  app/
    (site)/            public pages (home, about, internships, gallery, journey, wings, contact)
    admin/             login + dashboards (overview, content, events, gallery, journal)
    portal/            internship portal: login, invite links, programmes, tasks, reviews
    auth/callback/     finishes email-confirmation sign-ins
  components/
    ui/                shadcn/ui components
    home/              landing-page sections (hero, india-map, members, pillars, …)
    admin/             dashboard UI (content editor, events manager, gallery manager, …)
    portal/            portal UI (programme dashboard, intern work area, rich-text editor, …)
  lib/
    content/           schemas, cached public queries, admin session helpers
    admin/             server actions (content, events, gallery, auth) + image upload helper
    portal/            portal session, queries, server actions, progress maths, file uploads
    supabase/          browser / server / public clients and the session proxy
  proxy.ts             refreshes the Supabase session on /admin, /portal and /auth routes
  data/site.ts         default content
supabase/              SQL: schema.sql, journal.sql + internships.sql + team-and-registry.sql (existing projects), seed.sql (optional), make-admin.sql
scripts/               placeholder image generator
```

The shadcn components were added by hand from the shadcn sources and are configured in `components.json`.
`npx shadcn add <component>` works as normal for new ones.
