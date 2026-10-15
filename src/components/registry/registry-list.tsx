"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight, MapPin, Search, Users } from "lucide-react";

import { cn } from "@/lib/utils";
import type { RegisteredMember } from "@/lib/content/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const PAGE_SIZE = 50;

/** Lower-case text without accents, for forgiving search. */
const fold = (v: string) => v.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

/** The last part of "City, State" — used for the place filter. */
const regionOf = (location: string) => location.split(",").pop()?.trim() ?? "";

/** Searchable, paginated list of every registered member. */
export function RegistryList({ members }: { members: RegisteredMember[] }) {
  const [query, setQuery] = React.useState("");
  const [region, setRegion] = React.useState("");
  const [page, setPage] = React.useState(0);
  const listTop = React.useRef<HTMLDivElement>(null);

  const regions = React.useMemo(
    () =>
      Array.from(new Set(members.map((m) => regionOf(m.location)).filter(Boolean))).sort((a, b) =>
        a.localeCompare(b),
      ),
    [members],
  );

  const filtered = React.useMemo(() => {
    const q = fold(query.trim());
    return members.filter(
      (m) =>
        (!region || regionOf(m.location) === region) &&
        (!q || fold(`${m.name} ${m.location} ${m.code}`).includes(q)),
    );
  }, [members, query, region]);

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = Math.min(page, pages - 1);
  const shown = filtered.slice(current * PAGE_SIZE, (current + 1) * PAGE_SIZE);

  const go = (next: number) => {
    setPage(next);
    listTop.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  if (members.length === 0) {
    return (
      <div className="flex flex-col items-center rounded-xl border border-dashed px-6 py-20 text-center">
        <Users className="size-10 text-gold" strokeWidth={1.3} />
        <p className="mt-4 font-serif text-2xl text-ink">The member list is being prepared</p>
        <p className="mt-2 text-sm text-muted-foreground">Check back soon.</p>
      </div>
    );
  }

  return (
    <div ref={listTop} className="scroll-mt-28">
      <div className="flex flex-col gap-3 sm:flex-row">
        <label className="relative flex-1">
          <span className="sr-only">Search members</span>
          <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(0);
            }}
            placeholder="Search by name, place or member ID"
            className="h-12 bg-white pl-10 text-base"
          />
        </label>
        {regions.length > 1 && (
          <label className="sm:w-60">
            <span className="sr-only">Filter by place</span>
            <select
              value={region}
              onChange={(e) => {
                setRegion(e.target.value);
                setPage(0);
              }}
              className="h-12 w-full rounded-md border border-input bg-white px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/30"
            >
              <option value="">All places</option>
              {regions.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>

      <p className="mt-6 mb-3 text-sm text-muted-foreground" aria-live="polite">
        {filtered.length === members.length
          ? `${members.length.toLocaleString("en-IN")} members`
          : `${filtered.length.toLocaleString("en-IN")} of ${members.length.toLocaleString("en-IN")} members`}
        {pages > 1 &&
          ` · showing ${(current * PAGE_SIZE + 1).toLocaleString("en-IN")}–${Math.min(
            (current + 1) * PAGE_SIZE,
            filtered.length,
          ).toLocaleString("en-IN")}`}
      </p>

      <div className="overflow-hidden rounded-xl border bg-white">
        <div className="hidden grid-cols-[9rem_1fr_1fr] gap-4 border-b bg-paper px-5 py-3 text-[11px] font-semibold tracking-[0.18em] text-muted-foreground uppercase sm:grid">
          <span>Member ID</span>
          <span>Name</span>
          <span>Location</span>
        </div>
        {shown.length === 0 ? (
          <p className="px-5 py-14 text-center text-sm text-muted-foreground">
            No members match “{query}”.
          </p>
        ) : (
          <ol className="divide-y">
            {shown.map((m) => (
              <li
                key={m.id}
                className="grid grid-cols-[1fr_auto] items-center gap-x-4 gap-y-0.5 px-5 py-3.5 transition-colors hover:bg-paper/60 sm:grid-cols-[9rem_1fr_1fr]"
              >
                <span className="order-2 font-mono text-xs font-medium text-gold-dark tabular-nums sm:order-none sm:text-sm">
                  {m.code}
                </span>
                <span className="order-1 font-medium text-ink sm:order-none">{m.name}</span>
                <span
                  className={cn(
                    "order-3 col-span-2 flex items-center gap-1.5 text-sm text-muted-foreground sm:order-none sm:col-span-1",
                    !m.location && "hidden sm:flex",
                  )}
                >
                  {m.location && <MapPin className="size-3.5 shrink-0 text-gold sm:hidden" />}
                  {m.location || "—"}
                </span>
              </li>
            ))}
          </ol>
        )}
      </div>

      {pages > 1 && (
        <nav aria-label="Pages" className="mt-6 flex items-center justify-between gap-3">
          <Button variant="outline" onClick={() => go(current - 1)} disabled={current === 0}>
            <ChevronLeft /> Previous
          </Button>
          <span className="text-sm text-muted-foreground tabular-nums">
            Page {current + 1} of {pages}
          </span>
          <Button variant="outline" onClick={() => go(current + 1)} disabled={current >= pages - 1}>
            Next <ChevronRight />
          </Button>
        </nav>
      )}
    </div>
  );
}
