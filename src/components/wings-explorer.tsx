"use client";

import * as React from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";

import { cn } from "@/lib/utils";
import type { Wing } from "@/lib/content/schema";
import { Button } from "@/components/ui/button";
import { SmartLink } from "@/components/smart-link";
import { easeOut } from "@/components/motion";
import { iconComponents } from "@/components/icon-map";

export const wingIconComponents = iconComponents;

export function WingsExplorer({ wings }: { wings: Wing[] }) {
  const [active, setActive] = React.useState(wings[0]?.key);
  const wing = wings.find((w) => w.key === active) ?? wings[0];
  if (!wing) return null;
  const Icon = wingIconComponents[wing.icon];
  const index = wings.indexOf(wing);

  return (
    <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:gap-14">
      <ul className="flex flex-col border-t" role="tablist" aria-label="Organisation wings">
        {wings.map((w, i) => {
          const WingIcon = wingIconComponents[w.icon];
          const selected = w.key === active;
          return (
            <li key={w.key} className="border-b">
              <button
                role="tab"
                aria-selected={selected}
                aria-controls="wing-panel"
                onClick={() => setActive(w.key)}
                onMouseEnter={() => setActive(w.key)}
                className="group relative flex w-full items-center gap-5 py-5 text-left"
              >
                {selected && (
                  <motion.span
                    layoutId="wing-marker"
                    className="absolute top-0 bottom-0 -left-4 w-[3px] gold-gradient"
                    transition={{ type: "spring", stiffness: 400, damping: 36 }}
                  />
                )}
                <span
                  className={cn(
                    "font-serif text-sm tabular-nums",
                    selected ? "text-gold-dark" : "text-muted-foreground",
                  )}
                >
                  0{i + 1}
                </span>
                <span
                  className={cn(
                    "flex-1 font-serif text-2xl font-semibold transition-colors",
                    selected ? "text-ink" : "text-foreground/45 group-hover:text-foreground/75",
                  )}
                >
                  {w.name}
                </span>
                <WingIcon
                  className={cn(
                    "size-5 transition-colors",
                    selected ? "text-gold" : "text-foreground/25",
                  )}
                  strokeWidth={1.5}
                />
              </button>
            </li>
          );
        })}
      </ul>

      <div className="lg:sticky lg:top-28 lg:self-start">
        <AnimatePresence mode="wait">
          <motion.article
            key={wing.key}
            id="wing-panel"
            role="tabpanel"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.35, ease: easeOut }}
            className="relative overflow-hidden rounded-xl bg-ink p-8 text-white sm:p-10"
          >
            <div className="h-[3px] w-14 gold-gradient" />
            <div className="mt-8 flex items-start justify-between gap-6">
              <div>
                <p className="text-xs tracking-[0.22em] text-gold-light uppercase">
                  Wing {String(index + 1).padStart(2, "0")} of{" "}
                  {String(wings.length).padStart(2, "0")}
                </p>
                <h2 className="mt-3 text-4xl leading-tight font-semibold text-white sm:text-5xl">
                  {wing.name}
                </h2>
              </div>
              <Icon className="size-12 shrink-0 text-white/15" strokeWidth={1} />
            </div>
            <p className="mt-6 text-lg leading-relaxed text-white/70">{wing.summary}</p>

            <div className="mt-8 border-t border-white/10 pt-6">
              <p className="text-xs tracking-[0.22em] text-white/45 uppercase">Key activities</p>
              <ul className="mt-4 flex flex-col gap-3">
                {wing.activities.map((a, i) => (
                  <motion.li
                    key={a}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + i * 0.06 }}
                    className="flex items-center gap-3"
                  >
                    <span className="size-1.5 rounded-full bg-gold-light" />
                    {a}
                  </motion.li>
                ))}
              </ul>
            </div>

            <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-6">
              <div>
                <p className="text-xs text-white/45">Wing head</p>
                <p className="font-serif text-xl">{wing.head}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {wing.viewUrl && (
                  <Button asChild variant="gold">
                    <SmartLink href={wing.viewUrl}>
                      {wing.viewLabel || "View"} <ArrowUpRight />
                    </SmartLink>
                  </Button>
                )}
                <Button
                  asChild
                  variant={wing.viewUrl ? "outline" : "inverse"}
                  className={
                    wing.viewUrl
                      ? "border-white/25 bg-transparent text-white hover:border-white hover:bg-white/5 hover:text-white"
                      : undefined
                  }
                >
                  <Link href={`/contact?subject=wing-${wing.key}`}>
                    Volunteer with this wing <ArrowUpRight />
                  </Link>
                </Button>
              </div>
            </div>
          </motion.article>
        </AnimatePresence>
      </div>
    </div>
  );
}
