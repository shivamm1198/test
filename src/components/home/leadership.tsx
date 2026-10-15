import { ArrowUpRight, Check, MapPin } from "lucide-react";

import type { Leadership } from "@/lib/content/schema";
import { Button } from "@/components/ui/button";
import { SmartLink } from "@/components/smart-link";
import { Reveal, Stagger, StaggerItem } from "@/components/motion";
import { SectionHeading } from "@/components/section-heading";
import { iconComponents } from "@/components/icon-map";

/** Campus and Court Leadership programmes, each with its own apply link. */
export function LeadershipSection({ leadership }: { leadership: Leadership }) {
  if (leadership.programmes.length === 0) return null;
  return (
    <section id="leadership" className="relative scroll-mt-20 overflow-hidden">
      <div
        aria-hidden
        className="paper-grid absolute inset-0 [mask-image:radial-gradient(ellipse_at_50%_0%,black,transparent_65%)]"
      />
      <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8 lg:py-32">
        <Reveal>
          <SectionHeading
            eyebrow={leadership.eyebrow}
            title={leadership.title}
            description={leadership.description}
          />
        </Reveal>

        <Stagger className="mt-14 grid gap-6 md:grid-cols-2">
          {leadership.programmes.map((p) => {
            const Icon = iconComponents[p.icon];
            return (
              <StaggerItem
                key={p.title}
                className="group relative flex h-full flex-col overflow-hidden rounded-xl border bg-white transition-shadow duration-300 hover:shadow-[0_30px_60px_-40px_rgba(0,0,0,0.45)]"
              >
                <div className="h-[3px] gold-gradient" />
                <div className="flex flex-1 flex-col p-7 sm:p-9">
                  <div className="flex items-start justify-between gap-6">
                    <span className="grid size-12 place-items-center rounded-full bg-ink text-gold-light">
                      <Icon className="size-5" strokeWidth={1.6} />
                    </span>
                  </div>
                  <h3 className="mt-6 text-3xl font-semibold text-ink sm:text-[2.1rem]">
                    {p.title}
                  </h3>
                  {p.where && (
                    <p className="mt-2 flex items-start gap-1.5 text-sm font-medium text-gold-dark">
                      <MapPin className="mt-0.5 size-4 shrink-0" />
                      {p.where}
                    </p>
                  )}
                  {p.text && <p className="mt-4 leading-relaxed text-muted-foreground">{p.text}</p>}
                  {p.duties.length > 0 && (
                    <ul className="mt-6 grid gap-2.5 border-t pt-6">
                      {p.duties.map((d) => (
                        <li key={d} className="flex items-start gap-3 text-sm text-foreground/80">
                          <Check className="mt-0.5 size-4 shrink-0 text-gold" />
                          {d}
                        </li>
                      ))}
                    </ul>
                  )}
                  <div className="mt-auto pt-8">
                    <Button asChild size="lg" className="w-full sm:w-auto">
                      <SmartLink href={p.url || "/contact?subject=leadership"}>
                        {p.buttonLabel || `Apply for ${p.title}`} <ArrowUpRight />
                      </SmartLink>
                    </Button>
                  </div>
                </div>
              </StaggerItem>
            );
          })}
        </Stagger>
      </div>
    </section>
  );
}
