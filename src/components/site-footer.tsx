import Link from "next/link";
import { ArrowUpRight, HeartHandshake, Mail, MapPin, Phone } from "lucide-react";

import { nav, navMore } from "@/data/site";
import type { Donate, Site } from "@/lib/content/schema";
import { CopyButton } from "@/components/copy-button";
import { SmartLink } from "@/components/smart-link";
import { Logo } from "@/components/logo";
import { GoldStrip } from "@/components/section-heading";
import { socialLinks } from "@/components/social-icons";

const programmes = [
  { href: "/internships", label: "Internships" },
  { href: "/internships#scholarships", label: "Scholarships" },
  { href: "/wings", label: "Organisation Wings" },
  { href: "/gallery", label: "Events & Gallery" },
  { href: "/portal", label: "Intern login" },
];

export function SiteFooter({ site, year, donate }: { site: Site; year: number; donate?: Donate }) {
  const socials = socialLinks(site.socials);
  return (
    <footer className="bg-ink text-white">
      <GoldStrip />
      {donate?.show && <DonateBand donate={donate} />}
      <div className="mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-6 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.3fr] lg:px-8">
        <div className="flex flex-col gap-5">
          <Logo site={site} inverse />
          <p className="max-w-sm text-sm leading-relaxed text-white/60">{site.description}</p>
          <div className="flex gap-2">
            {socials.map(({ href, label, Icon }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noreferrer"
                aria-label={label}
                className="grid size-10 place-items-center rounded-full border border-white/15 text-white/70 transition-colors hover:border-gold-light hover:text-gold-light"
              >
                <Icon className="size-4" />
              </a>
            ))}
          </div>
        </div>

        <FooterColumn title="Explore" links={[...nav, ...navMore]} />
        <FooterColumn title="Programmes" links={programmes} />

        <div className="flex flex-col gap-4">
          <h3 className="font-sans text-xs font-semibold tracking-[0.22em] text-gold-light uppercase">
            Reach us
          </h3>
          <ul className="flex flex-col gap-3 text-sm text-white/70">
            <li className="flex gap-3">
              <MapPin className="mt-0.5 size-4 shrink-0 text-white/40" />
              {site.address}
            </li>
            <li>
              <a href={`mailto:${site.email}`} className="flex gap-3 hover:text-white">
                <Mail className="mt-0.5 size-4 shrink-0 text-white/40" />
                {site.email}
              </a>
            </li>
            <li>
              <a
                href={`tel:${site.phone.replace(/\s/g, "")}`}
                className="flex gap-3 hover:text-white"
              >
                <Phone className="mt-0.5 size-4 shrink-0 text-white/40" />
                {site.phone}
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-6 text-xs text-white/45 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <p>
            © {year} {site.name}. All rights reserved.
          </p>
          <p className="tracking-[0.2em] uppercase">Integrity · Unity · Justice · Empowerment</p>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: { href: string; label: string }[];
}) {
  return (
    <div className="flex flex-col gap-4">
      <h3 className="font-sans text-xs font-semibold tracking-[0.22em] text-gold-light uppercase">
        {title}
      </h3>
      <ul className="flex flex-col gap-2.5 text-sm">
        {links.map((l) => (
          <li key={l.href}>
            <Link href={l.href} className="text-white/70 transition-colors hover:text-white">
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** "Support our work": payment link, UPI ID and any other details. */
function DonateBand({ donate }: { donate: Donate }) {
  return (
    <div className="border-b border-white/10">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-10 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <div className="flex items-start gap-4">
          <span className="grid size-12 shrink-0 place-items-center rounded-full border border-gold/40 text-gold-light">
            <HeartHandshake className="size-5" strokeWidth={1.6} />
          </span>
          <div>
            <h2 className="text-3xl font-semibold text-white">{donate.title || "Donate"}</h2>
            {donate.text && (
              <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-white/60">{donate.text}</p>
            )}
            {donate.details && (
              <p className="mt-2 max-w-xl text-xs leading-relaxed whitespace-pre-line text-white/45">
                {donate.details}
              </p>
            )}
          </div>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center lg:shrink-0">
          {donate.upiId && (
            <div className="flex items-center justify-between gap-3 rounded-md border border-white/15 px-4 py-2.5 text-sm">
              <span>
                <span className="mr-2 text-xs tracking-[0.16em] text-white/45 uppercase">UPI</span>
                <span className="font-medium text-white">{donate.upiId}</span>
              </span>
              <CopyButton
                value={donate.upiId}
                className="text-xs text-gold-light hover:text-white"
              />
            </div>
          )}
          <SmartLink
            href={donate.url || "/contact?subject=donation"}
            className="gold-gradient inline-flex h-12 items-center justify-center gap-2 rounded-md px-7 text-[15px] font-medium text-ink shadow-xs transition hover:brightness-105"
          >
            {donate.buttonLabel || "Donate"} <ArrowUpRight className="size-4" />
          </SmartLink>
        </div>
      </div>
    </div>
  );
}
