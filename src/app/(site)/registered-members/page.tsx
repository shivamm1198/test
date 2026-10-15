import type { Metadata } from "next";

import { getContent, getRegisteredMembers } from "@/lib/content/queries";
import { PageHero } from "@/components/page-hero";
import { RegistryList } from "@/components/registry/registry-list";

export async function generateMetadata(): Promise<Metadata> {
  const { sectionText, site } = await getContent();
  return {
    title: sectionText.registryEyebrow || "Registered Members",
    description:
      sectionText.registryDescription || `Members registered with ${site.name} across India.`,
  };
}

export default async function RegisteredMembersPage() {
  const [{ sectionText: text }, members] = await Promise.all([
    getContent(),
    getRegisteredMembers(),
  ]);

  return (
    <>
      <PageHero
        eyebrow={text.registryEyebrow || "Registered members"}
        title={text.registryTitle || "Our members across India"}
        description={text.registryDescription || undefined}
      >
        <p className="flex items-baseline gap-2 text-sm text-muted-foreground">
          <span className="font-serif text-4xl font-semibold text-ink tabular-nums">
            {members.length.toLocaleString("en-IN")}
          </span>
          registered {members.length === 1 ? "member" : "members"}
        </p>
      </PageHero>
      <section className="mx-auto max-w-5xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
        <RegistryList members={members} />
      </section>
    </>
  );
}
