import type { Metadata } from "next";

import { joinHref } from "@/lib/content/links";
import { getContent } from "@/lib/content/queries";
import { getCurrentYear } from "@/lib/current-year";
import { mediaUrl } from "@/lib/supabase/env";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export async function generateMetadata(): Promise<Metadata> {
  const { site } = await getContent();
  return {
    title: {
      default: `${site.name} (${site.short}) — ${site.tagline}`,
      template: `%s · ${site.name}`,
    },
    description: site.description,
    icons: site.logo ? { icon: mediaUrl(site.logo), apple: mediaUrl(site.logo) } : undefined,
    openGraph: {
      title: site.name,
      description: site.description,
      type: "website",
      locale: "en_IN",
    },
  };
}

export default async function SiteLayout({ children }: LayoutProps<"/">) {
  const [{ site, links, donate }, year] = await Promise.all([getContent(), getCurrentYear()]);

  return (
    <>
      <a
        href="#main"
        className="sr-only z-50 rounded-md bg-ink px-4 py-2 text-white focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        Skip to content
      </a>
      <SiteHeader site={site} joinHref={joinHref(links)} />
      <main id="main" className="flex-1">
        {children}
      </main>
      <SiteFooter site={site} year={year} donate={donate} />
    </>
  );
}