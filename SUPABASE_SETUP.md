# Supabase setup guide

This connects the website to Supabase so the president can edit content from the dashboards at
**`/admin`**. It takes about 15 minutes, all in the Supabase dashboard. No coding needed.

**What you'll end up with**

| Dashboard              | URL               | What it manages                                                                                                                                                       |
| ---------------------- | ----------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Homepage editor**    | `/admin/content`  | Organisation details, headline numbers, members map, founder, internships, steps, FAQs, scholarships, news, YouTube videos, members, patrons, pillars, wings, journey |
| **Events**             | `/admin/events`   | Create, edit, hide and delete events with a cover photo                                                                                                               |
| **Gallery**            | `/admin/gallery`  | Bulk-upload photos with captions and categories, edit, delete                                                                                                         |
| **Student Journal**    | `/admin/journal`  | Student articles with an attached PDF or Word paper                                                                                                                   |
| **Registered members** | `/admin/registry` | The full member list on `/registered-members`: name, location and member ID. Import from a spreadsheet                                                                |
| **Team**               | `/admin/team`     | President only: appoint dashboard coordinators with an invite link, remove them                                                                                       |
| **Messages**           | `/admin/messages` | President only: messages sent through the contact form on `/contact`                                                                                                  |
| **Internship portal**  | `/portal`         | Internships, coordinators, intern invite links, tasks with deadlines, intern work and progress                                                                        |

---

## Step 1: Create the project

1. Go to **[supabase.com/dashboard](https://supabase.com/dashboard)** and sign in (or sign up, which is free).
2. Click **New project**.
3. Fill in:
   - **Organization:** your organisation (create one if asked).
   - **Project name:** `vidhi-ekta-Sngh`
   - **Database password:** click **Generate a password** and **save it somewhere safe**. You won't
     need it for this setup, but you can't see it again later.
   - **Region:** **South Asia (Mumbai)**, which is closest to your visitors.
4. Click **Create new project** and wait 1–2 minutes until the dashboard finishes setting up.

## Step 2: Create the tables (SQL)

1. In the left sidebar, open **SQL Editor**.
2. Click **+ New query** (or the **+** tab).
3. Open the file [`supabase/schema.sql`](supabase/schema.sql) from this repository, **copy all of it**,
   and paste it into the editor.
4. Click **Run** (or press <kbd>Ctrl</kbd>/<kbd>⌘</kbd> + <kbd>Enter</kbd>).
   You should see **"Success. No rows returned"**.

This creates:

- `admins`: who is allowed into the dashboards
- `site_content`: the homepage editor's sections
- `events` and `gallery_items`
- a public `media` storage bucket for images (10 MB per file)
- security rules: **anyone can read; only admins can add, change or delete**
- the **internship portal** tables and a private `internship-files` bucket for interns' work

> The script is safe to run again. Re-running it changes nothing that already exists.

> **Already set up before the Student Journal was added?** Run
> [`supabase/journal.sql`](supabase/journal.sql) once in a new SQL Editor query. It creates the
> `articles` table and a public `documents` bucket for PDF/Word papers (20 MB each). New projects
> don't need it, because `schema.sql` already includes it.

> **Already set up before the Internship portal was added?** Run
> [`supabase/internships.sql`](supabase/internships.sql) once in a new SQL Editor query. It creates
> the internship tables, the invite-link functions and a **private** `internship-files` bucket
> (25 MB per file). New projects don't need it, because `schema.sql` already includes it.

> **Already set up before contact-form Messages were added?** Run
> [`supabase/contact-messages.sql`](supabase/contact-messages.sql) once in a new SQL Editor query
> (after `team-and-registry.sql`). It creates the `contact_messages` table that only the president
> can read. New projects don't need it, because `schema.sql` already includes it.

> **Already set up before the Team page and Registered Members were added?** Run
> [`supabase/team-and-registry.sql`](supabase/team-and-registry.sql) once in a new SQL Editor query
> (after `internships.sql`). It adds the president / coordinator roles, coordinator invite links and
> the `registered_members` table, and makes the Internship portal president-only. Everyone already
> in `admins` becomes a **president**. New projects don't need it, because `schema.sql` already
> includes it.

### Optional: start with the sample events and photos

To keep the sample events and gallery from the preview (you can delete them later from the dashboards),
open a **new query**, paste [`supabase/seed.sql`](supabase/seed.sql), and click **Run**.
Skip this to start with an empty events list and gallery.

## Step 3: Check the storage bucket

1. Open **Storage** in the left sidebar.
2. You should see a bucket called **`media`** marked **Public**. If it's there, nothing else is needed.

## Step 4: Create the president's login

1. Open **Authentication → Users**.
2. Click **Add user → Create new user**.
3. Enter the president's **email** and a **strong password**, and tick **Auto Confirm User**.
4. Click **Create user**.

## Step 5: Make that user an admin

Creating a login is not enough. The account must also be listed as an admin.

1. Go back to **SQL Editor → + New query**.
2. Paste [`supabase/make-admin.sql`](supabase/make-admin.sql).
3. Replace `president@example.com` with the email from Step 4.
4. Click **Run**. The result table at the bottom should list that email.

This makes them a **president** (full access). Repeat steps 4–5 only for another president.
**Coordinators** (people who help edit the website) are appointed from the dashboard instead: see
**Team** in Step 9. To remove a president later:
`delete from public.admins where email = 'someone@example.com';`

## Step 6: Sign-up settings (for intern accounts)

Interns and coordinators create their own account when they open an invite link, so sign-ups must
stay **on**. That's safe: an account that didn't come through a valid invite link has no access to
anything. Only the president (Step 5) and coordinators the president appoints can open the website
dashboards.

1. Open **Authentication → Sign In / Providers** (called **Providers** in some versions).
2. Under **User Signups**, make sure **Allow new users to sign up** is **on**.
3. Under **Email**, switch **Confirm email** **off**, then click **Save**.
   Supabase's built-in email service only delivers to your own team's addresses, so without your
   own SMTP server interns would never receive the confirmation email. With it off, interns are
   signed in straight after creating their account.

> **Prefer confirmation emails?** Set up your own SMTP server first
> (**Authentication → Emails → SMTP Settings**, e.g. with Resend, Brevo or Gmail), then leave
> **Confirm email** on. Interns then click the link in the email to finish joining.

> If you turned sign-ups off earlier (older versions of this guide recommended it), switch them back on.

## Step 7: Copy the two keys into the website

1. Open **Project Settings** (gear icon at the bottom of the sidebar).
2. **Project URL:** go to **Data API** and copy the **Project URL**
   (looks like `https://abcd1234.supabase.co`).
   You can also click the **Connect** button at the top of the dashboard to see it.
3. **Publishable key:** go to **API Keys** and copy the **Publishable key** (starts with `sb_publishable_`).
   If your project only shows legacy keys, click **Create new API keys** first. The legacy `anon` key also
   works, but stops working at the end of 2026.

> **Never** use the _secret_ key (`sb_secret_…`) or `service_role` key in the website. They aren't
> needed.

### Where to paste them

**On Vercel (live site):** Project → **Settings → Environment Variables**, add both for
**Production**, **Preview** and **Development**, then **Redeploy**:

| Name                                   | Value                |
| -------------------------------------- | -------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`             | your Project URL     |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | your publishable key |

**On your computer:** copy `.env.example` to `.env.local`, paste the values, and restart `npm run dev`.

## Step 8: Set the site URL for auth

1. Open **Authentication → URL Configuration**.
2. Set **Site URL** to your live website address, e.g. `https://vidhiektaSngh.org`
   (or your `…vercel.app` address).
3. Under **Redirect URLs**, click **Add URL** and add `https://your-site/auth/callback`
   (e.g. `https://vidhiektasangh.org/auth/callback`). Add `http://localhost:3000/auth/callback` too
   if you run the site on your computer. This is where confirmation emails send people back to.
4. Click **Save**.

## Step 9: Sign in

Open **`https://your-site/admin`**, sign in with the president's email and password, and you're in.

- **Homepage editor:** pick a section on the left, edit, then **Save & publish** (or <kbd>Ctrl</kbd>/<kbd>⌘</kbd> +
  <kbd>S</kbd>). The website updates immediately. **Restore original** brings back the built-in text for
  that section.
- **Forms & links** (in the Homepage editor): paste your Google Form links for **Join VES** and
  **Scholarships**. Each internship and scholarship also has its own **Application form link**. When a
  link is empty, the button falls back to the contact page (or an email application for internships).
- **Logo:** upload it in **Homepage editor → Organisation details**. It appears in the header, footer,
  dashboard and browser tab. Use a square PNG (transparent background works best).
- **Photos around the site** (Homepage editor → Website images): the About images on the homepage and
  About page, and the small floating photos around the members map (4), the About image (2) and the
  founder portrait (2). Landscape photos look best; remove one to hide it.
- **Student Journal** (`/admin/journal`): publish student articles with author details, a summary,
  the article text, an optional cover image and an attached PDF or Word paper. The latest three appear
  on the homepage below Events, and all of them on `/journal`. Each article has its own page.
- **Page text** (Homepage editor): the homepage About section, every part of the About page, the
  Wings page (including "How we're organised"), and shared headings (founder, pillars, patrons,
  journal, and the Join banner). The hero shows the **Tagline** and **Short description** from
  Organisation details.
- **Events:** **New event**, add a cover photo, dates, place and description. Turn **Visible** off
  to hide an event without deleting it.
- **Gallery:** drop several photos at once, set captions and categories, then **Upload**. Large phone
  photos are resized automatically before upload.
- **Campus & Court Leadership** (Homepage editor → Programmes → Leadership programmes): the text and
  responsibilities for each programme, and its **Application form link** (the apply button). Add or
  remove programmes there too.
- **Latest update** (Homepage editor → Updates → Latest update (hero)): one line in the hero about what
  VES did most recently, with an optional link. Turn it off with the switch. This is separate from the
  Inside VES news list.
- **Donate** (Homepage editor → Organisation → Donate (footer)): the block at the top of the footer.
  Add a payment link (Razorpay, Instamojo, a UPI payment page…), a UPI ID (shown with a copy button)
  and any other details such as bank account or 80G information.
- **Wings:** each wing has a **View button link** and label (Homepage editor → About VES →
  Organisation wings). The View button appears once a link is set. Links can be full web addresses
  or pages on the site such as `/gallery`.
- **Registered members** (`/admin/registry`): the full member list shown on `/registered-members`
  (in the header's **More** menu). **Import list** accepts rows copied from Excel or Google Sheets,
  or a CSV file, one member per line: _Name, Location, ID_. Location and ID are optional; members
  without an ID get the next one automatically (VES-0001, VES-0002 …). **Export CSV** downloads the
  whole list. Tick rows to delete several at once.
- **Messages** (`/admin/messages`, president only): every message sent through the contact form on
  `/contact`, newest first, with the sender's email, phone, college and topic. Unread messages show a
  gold count next to **Messages** in the sidebar. Open one to read it (it's marked read), then
  **Reply by email**, **Mark unread**, **Archive** or **Delete**. Coordinators and internship
  coordinators can't see this page or the messages: the database only lets the president read them.
  To stop spam, each email address can send at most 5 messages an hour.
- **Team** (`/admin/team`, president only): **Appoint a coordinator** creates an invite link (expires
  after 1–30 days, for 1 person by default). Send it to them; they create an account or sign in and get
  the dashboard. Coordinators can use every dashboard (Homepage editor, Events, Gallery, Student
  Journal, Registered members) but **not** the Internship portal or the Team page. Remove a
  coordinator from the same page; their access ends immediately.

## Step 10: Run an internship (the Internship portal)

The portal lives at **`https://your-site/portal`** (also linked as **Intern login** in the website
footer and **Internship portal** in the dashboard). There are three kinds of account:

| Account                    | How they get in                                   | What they can do                                                                                                      |
| -------------------------- | ------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| **President**              | The admin login from Steps 4–5                    | Everything: create internships, appoint coordinators, and everything a coordinator can do in every internship         |
| **Internship coordinator** | A _coordinator_ invite link made by the president | Only their internship(s): invite interns, assign tasks with deadlines, follow progress, give feedback, remove interns |
| **Intern** (student)       | An _intern_ invite link                           | Only their own tasks: write or upload their work, complete tasks, see what's left and their performance               |

Internship coordinators and interns can only reach the portal, never the website dashboards. The
_dashboard_ coordinators from the Team page are different: they edit the website but can't open the
portal.

1. **Create the internship.** Open `/portal` → **New internship**. Give it a name, start and end dates
   and a short description. Make one for each type of internship (e.g. _Legal Research · Winter 2026_,
   _Content Writing_).
2. **Appoint a coordinator.** Open the internship → **Invite links** → set **Joins as** to
   **Coordinator**, pick an expiry and set **Maximum sign-ups** to `1` → **Create link** → **Copy**.
   Send it to the coordinator. They open it, create an account (name, email, password) and land on
   the internship's dashboard.
3. **Invite interns.** The coordinator (or president) creates an **Intern** link, e.g. _Batch A_,
   expiring in 7 days, optionally limited to the number of seats, and shares it on WhatsApp or by email.
   Every intern who opens it before it expires creates an account and joins. **Revoke** stops a link
   early; people who already joined keep access. An intern with an account can sign in later at
   `/portal/login`.
4. **Assign tasks.** **New task** → title, type of work (Article, Research paper, Case comment…),
   instructions, a **deadline**, how to submit (**write in the editor**, **upload a file**, or either),
   and who it's for (every intern, or selected interns).
5. **Interns do the work.** Each intern sees _"3 of 8 tasks completed · 5 remaining"_, their next
   deadline, and their tasks grouped as Overdue, To do and Completed. A task opens a clean writing page
   (title, a Medium-style editor with headings, lists, quotes and links) and an upload area (up to 5 PDF,
   Word, PowerPoint or image files, 25 MB each). Work saves automatically as a draft;
   **Complete task** hands it in. Late work is still accepted and marked late.
6. **Review.** On the internship's **Tasks** tab, **Submissions** lists every intern's status. Open one
   to read it, download files, write feedback and **Save feedback**, or **Return for changes** to reopen
   it for the intern.
7. **Performance.** The **People** tab shows each intern's completed / on-time / late / missed tasks.
   After the end date, each intern sees a **performance report**: tasks completed, completion rate,
   on time vs late, and an overall rating (Outstanding ≥ 90%, Very good ≥ 75%, Good ≥ 50%).

Interns' files are stored in the **private** `internship-files` bucket. Only the intern who uploaded a
file, the internship's coordinators and the president can open it, through links that expire after an
hour.

---

## Troubleshooting

| Problem                                                                                                 | Fix                                                                                                            |
| ------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| Login page says **"Supabase isn't connected yet"**                                                      | The two environment variables are missing. Add them (Step 7) and redeploy or restart.                          |
| **"Incorrect email or password"**                                                                       | Check the user in **Authentication → Users**, or use **⋯ → Send password recovery** there.                     |
| **"This account doesn't have dashboard access"**                                                        | Run `supabase/make-admin.sql` with that email (Step 5).                                                        |
| **"Email isn't confirmed"**                                                                             | In **Authentication → Users**, open the user and confirm them, or recreate with **Auto Confirm User** ticked.  |
| Upload fails with **"new row violates row-level security"**                                             | The account isn't in `admins`, or `schema.sql` didn't finish. Re-run both.                                     |
| **"permission denied for table …"**                                                                     | Re-run `schema.sql`; it includes the required grants.                                                          |
| A change made directly in Supabase's **Table Editor** isn't on the site                                 | Edits from the dashboards appear instantly. Direct table edits show up within about a minute.                  |
| Want to change the president's password                                                                 | **Authentication → Users → ⋯ → Send password recovery**, or delete and recreate the user (then re-run Step 5). |
| Intern sees **"New accounts are switched off in Supabase"**                                             | Turn **Allow new users to sign up** on (Step 6).                                                               |
| Intern is told **"we've emailed you a confirmation link"** but nothing arrives                          | Turn **Confirm email** off (Step 6), or set up custom SMTP. Then they open the invite link again.              |
| Invite page says **"This link has expired"**                                                            | The link expired, was revoked or reached its sign-up limit. Create a new one in **Invite links**.              |
| **"This account isn't part of an internship yet"** on `/portal/login`                                   | The account never joined, or was removed. Send them a fresh invite link.                                       |
| Portal shows **"relation internship_programs does not exist"**                                          | Run `supabase/internships.sql` (Step 2).                                                                       |
| Team or Registered members says **"Run supabase/team-and-registry.sql"**                                | Run `supabase/team-and-registry.sql` (Step 2).                                                                 |
| Messages says **"Run supabase/contact-messages.sql"**, or the contact form says it **couldn't be sent** | Run `supabase/contact-messages.sql` (Step 2).                                                                  |
| A coordinator says the Internship portal shows **"Not part of an internship"**                          | Expected: dashboard coordinators don't have portal access. Only the president does.                            |

## How it fits together (for developers)

- **Public pages** read Supabase with the publishable key through cached functions
  (`src/lib/content/queries.ts`, Next.js `'use cache'` + `cacheTag`). Dashboard saves call
  `updateTag(...)`, so changes show immediately. Otherwise caches refresh every minute.
- Every homepage section is validated with zod (`src/lib/content/schema.ts`) both when saving and when
  reading. A missing or invalid section falls back to the defaults in `src/data/site.ts`, so the site
  can't break.
- **Security** is enforced by Postgres Row Level Security (`public.is_admin()`), not just the app.
  Server Actions also check admin status before writing.
- Images are uploaded straight from the browser to the `media` bucket (after client-side resizing). The
  database stores the path, and files are removed when their event or photo is deleted.
- Without the environment variables, the whole site runs on the sample content in `src/data/site.ts`.
- **Internship portal** (`src/app/portal`, `src/lib/portal`): coordinators and interns are rows in
  `internship_members` (role `admin` or `intern`) and are created only by `redeem_invite()`, a
  security-definer function that checks the invite token's expiry, revocation and use limit. Row Level
  Security limits interns to their own submissions and assigned tasks, and coordinators to their own
  programmes. A trigger stops interns from moving work between tasks or writing their own feedback, and
  completed work can only be reopened through `review_submission()`. `src/proxy.ts` sends signed-out
  visitors on `/portal` to `/portal/login`.
