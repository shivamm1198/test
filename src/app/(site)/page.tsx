import { buildStats } from "@/lib/content/derive";
import { joinHref, scholarshipHref } from "@/lib/content/links";
import { getArticles, getContent, getEvents, getGallery } from "@/lib/content/queries";
import { getCurrentYear } from "@/lib/current-year";
import { AboutSection } from "@/components/home/about";
import { EventsSection } from "@/components/home/events";
import { JournalSection } from "@/components/home/journal";
import { FounderSection } from "@/components/home/founder";
import { GalleryPreview } from "@/components/home/gallery-preview";
import { Hero } from "@/components/home/hero";
import { InternshipSection } from "@/components/home/internship";
import { JoinCta } from "@/components/home/join-cta";
import { LeadershipSection } from "@/components/home/leadership";
import { MembersSection } from "@/components/home/members";
import { NewsSection } from "@/components/home/news";
import { PatronsSection } from "@/components/home/patrons";
import { PillarsSection } from "@/components/home/pillars";
import { ScholarshipSection } from "@/components/home/scholarship";
import { ValuesMarquee } from "@/components/home/values-marquee";
import { YoutubeSection } from "@/components/home/youtube";

export default async function HomePage() {
  const [content, events, gallery, year, articles] = await Promise.all([
    getContent(),
    getEvents(),
    getGallery(),
    getCurrentYear(),
    getArticles(),
  ]);

  return (
    <>
      <Hero
        site={content.site}
        stats={buildStats(content)}
        stateMembers={content.stateMembers}
        images={content.images}
        joinHref={joinHref(content.links)}
        latest={content.latestUpdate}
      />
      <ValuesMarquee />
      <AboutSection
        site={content.site}
        year={year}
        images={content.images}
        about={content.aboutSection}
      />
      <FounderSection
        founder={content.founder}
        images={content.images}
        text={content.sectionText}
      />
      {content.internships.length > 0 && (
        <InternshipSection
          internships={content.internships}
          email={content.site.email}
          text={content.sectionText}
        />
      )}
      {content.scholarships.length > 0 && (
        <ScholarshipSection
          scholarships={content.scholarships}
          applyHref={scholarshipHref(content.links)}
          text={content.sectionText}
        />
      )}
      <LeadershipSection leadership={content.leadership} />
      <GalleryPreview
        gallery={gallery}
        text={content.sectionText}
      />
      <EventsSection
        events={events.slice(0, 6)}
        text={content.sectionText}
      />
      <NewsSection
        news={content.news}
        text={content.sectionText}
      />
      {content.members.length > 0 && (
        <MembersSection
        members={content.members}
        text={content.sectionText}
        />
      )}
      <PillarsSection pillars={content.pillars} text={content.sectionText} />
      {content.patrons.length > 0 && (
        <PatronsSection patrons={content.patrons} text={content.sectionText} />
      )}
      <JournalSection articles={articles} text={content.sectionText} />
      {content.videos.length > 0 && (
        <YoutubeSection
          videos={content.videos}
          channelUrl={content.site.socials.youtube}
          text={content.sectionText}
        />
      )}
      <JoinCta joinHref={joinHref(content.links)} text={content.sectionText} />
    </>
  );
}
