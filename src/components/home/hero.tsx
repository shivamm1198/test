"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, ArrowUpRight } from "lucide-react";

import { cn } from "@/lib/utils";
import type { Stat } from "@/lib/content/derive";
import type { LatestUpdate, Site, SiteContent, SiteImages } from "@/lib/content/schema";
import { FloatingPhoto } from "@/components/floating-photo";
import { Button } from "@/components/ui/button";
import { CountUp, easeOut } from "@/components/motion";
import { IndiaMap } from "@/components/home/india-map";
import { SmartLink } from "@/components/smart-link";

const rise = (delay: number) => ({
  initial: { opacity: 0, y: 22 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.8, ease: easeOut, delay },
});

export function Hero({
  site,
  stats,
  stateMembers,
  images,
  joinHref,
  latest,
}: {
  site: Site;
  stats: Stat[];
  stateMembers: SiteContent["stateMembers"];
  images: SiteImages;
  joinHref: string;
  latest?: LatestUpdate;
}) {
  return (
    <section className="relative overflow-hidden">
      <div
        aria-hidden
        className="paper-grid absolute inset-0 [mask-image:radial-gradient(ellipse_at_30%_40%,black,transparent_70%)]"
      />
      <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-4 pt-14 pb-20 sm:px-6 lg:grid-cols-[1.05fr_1fr] lg:gap-10 lg:px-8 lg:pt-20 lg:pb-28">
        <div className="flex flex-col">
          <motion.p
            {...rise(0)}
            className="inline-flex w-fit items-center gap-2.5 rounded-full border bg-white px-3.5 py-1.5 text-xs font-medium text-foreground/70"
          >
            <span className="size-1.5 rounded-full bg-gold" />
            Est. {site.founded} · A national legal fraternity
          </motion.p>

          <motion.h1
            {...rise(0.08)}
            className="mt-7 text-[3.4rem] leading-[0.95] font-semibold text-ink sm:text-7xl xl:text-[5.6rem]"
          >
            {site.name}
          </motion.h1>

          <motion.div {...rise(0.16)} className="mt-5 flex items-center gap-4">
            <span className="h-px w-12 gold-gradient" aria-hidden />
            <span className="font-serif text-2xl text-gold-dark sm:text-3xl" lang="hi">
              {site.hindi}
            </span>
          </motion.div>

          {site.tagline && (
            <motion.p
              {...rise(0.2)}
              className="mt-6 font-serif text-2xl leading-snug text-ink/80 italic sm:text-[1.7rem]"
            >
              {site.tagline}
            </motion.p>
          )}

          {site.description && (
            <motion.p
              {...rise(0.24)}
              className="mt-4 max-w-xl text-base sm:text-lg leading-relaxed text-pretty text-muted-foreground"
            >
              {site.description}
            </motion.p>
          )}

          <motion.div {...rise(0.32)} className="mt-9 flex flex-wrap gap-3">
            <Button asChild size="lg">
              <SmartLink href={joinHref}>
                Become a part of family <ArrowUpRight /> {/* {site.short} */}
              </SmartLink>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/about">Our story</Link>
            </Button>
          </motion.div>

          {latest?.show && latest.text && (
            <motion.div {...rise(0.38)} className="mt-7">
              <LatestUpdateChip latest={latest} />
            </motion.div>
          )}

          <motion.dl
            {...rise(0.42)}
            className="mt-14 grid grid-cols-2 gap-y-6 border-t pt-8 sm:grid-cols-4"
          >
            {stats.map((s, i) => (
              <div
                key={s.label}
                className={cn(i % 2 === 1 && "border-l pl-6", i > 0 && "sm:border-l sm:pl-6")}
              >
                <dt className="sr-only">{s.label}</dt>
                <dd className="font-serif text-4xl font-semibold text-ink tabular-nums">
                  <CountUp value={s.value} />
                  <span className="text-gold">{s.suffix}</span>
                </dd>
                <dd className="mt-1 text-xs leading-snug text-muted-foreground">{s.label}</dd>
              </div>
            ))}
          </motion.dl>
        </div>

        <div className="relative lg:px-10 lg:pt-14 lg:pb-12">
          {/* Photos tucked behind the map card */}
          {/* <FloatingPhoto
            src={images.hero1}
            className="top-0 -left-8 z-0 hidden w-56 lg:block"
            rotate={-4}
            delay={0.6}
            sizes="224px"
          /> */}
          <FloatingPhoto
            src={images.hero3}
            className="-right-10 bottom-74 z-20 hidden w-44 lg:block"
            rotate={3}
            delay={0.8}
            duration={8}
            sizes="176px"
          />
          <motion.div
            className="relative z-10"
            initial={{ opacity: 0, y: 30, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 1, ease: easeOut, delay: 0.2 }}
          >
            <IndiaMap stateMembers={stateMembers} />
          </motion.div>
          {/* A small photo resting on the card's top edge, plus one more behind it */}
          <FloatingPhoto
            src={images.hero2}
            className="-top-3 right-2 z-20 hidden w-32 lg:block"
            rotate={5}
            delay={1}
            drift={6}
            duration={6}
            aspect="aspect-[4/3]"
            sizes="128px"
          />
          <FloatingPhoto
            src={images.hero4}
            className="bottom-50 -left-10 z-20 hidden w-44 lg:block"
            rotate={-3}
            delay={1.2}
            drift={7}
            duration={7.5}
            aspect="aspect-[16/10]"
            sizes="176px"
          />
        </div>
      </div>
    </section>
  );
}

/** "What VES did latest": one line, optionally linked. */
function LatestUpdateChip({ latest }: { latest: LatestUpdate }) {
  const body = (
    <>
      <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-ink px-2.5 py-1 text-[10px] font-semibold tracking-[0.16em] text-gold-light uppercase">
        <span className="relative flex size-1.5" aria-hidden>
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-gold-light opacity-70" />
          <span className="relative inline-flex size-1.5 rounded-full bg-gold-light" />
        </span>
        {latest.label || "Latest"}
      </span>
      <span className="min-w-0 flex-1 text-sm leading-snug text-foreground/80">
        {latest.text}
        {latest.date && (
          <span className="ml-2 text-xs whitespace-nowrap text-muted-foreground">
            {latest.date}
          </span>
        )}
      </span>
      {latest.url && (
        <ArrowRight className="size-4 shrink-0 text-gold-dark transition-transform group-hover:translate-x-0.5" />
      )}
    </>
  );
  const className =
    "group flex w-full max-w-xl items-center gap-3 rounded-2xl border bg-white/90 py-2 pr-4 pl-2 shadow-xs backdrop-blur transition-colors";
  return latest.url ? (
    <SmartLink href={latest.url} className={cn(className, "hover:border-foreground/30")}>
      {body}
    </SmartLink>
  ) : (
    <p className={className}>{body}</p>
  );
}
