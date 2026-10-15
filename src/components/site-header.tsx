"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, useMotionValueEvent, useScroll } from "framer-motion";
import { DropdownMenu } from "radix-ui";
import { ArrowUpRight, ChevronDown, Menu } from "lucide-react";

import { cn } from "@/lib/utils";
import { nav, navMore } from "@/data/site";
import type { Site } from "@/lib/content/schema";
import { Logo } from "@/components/logo";
import { SmartLink } from "@/components/smart-link";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

export function SiteHeader({ site, joinHref }: { site: Site; joinHref: string }) {
  const pathname = usePathname();
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  const [time, setTime] = React.useState("");

  React.useEffect(() => {
    const updateTime = () => {
      setTime(
        new Intl.DateTimeFormat("en-IN", {
          timeZone: "Asia/Kolkata",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
        }).format(new Date()),
      );
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);

    return () => clearInterval(interval);
  }, []);

  useMotionValueEvent(scrollY, "change", (y) => setScrolled(y > 12));

  return (
    <header
      className={cn(
        "sticky top-0 z-40 w-full transition-[background-color,box-shadow,backdrop-filter] duration-300",
        scrolled ? "bg-white/85 shadow-[0_1px_0_0_var(--border)] backdrop-blur-md" : "bg-white",
      )}
    >
      <div className="h-[3px] w-full gold-gradient" aria-hidden />
      <div className="mx-auto flex h-[4.5rem] max-w-7xl items-center justify-between gap-6 px-4 sm:px-6 lg:px-8">
        <Logo site={site} />

        <nav aria-label="Main" className="hidden items-center gap-0.5 lg:flex xl:gap-1">
          {nav.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative px-2 py-2 text-sm font-medium whitespace-nowrap transition-colors xl:px-3",
                  active ? "text-ink" : "text-foreground/60 hover:text-ink",
                )}
              >
                {item.label}
                {active && (
                  <motion.span
                    layoutId="nav-underline"
                    className="absolute inset-x-2 -bottom-px h-[2px] gold-gradient xl:inset-x-3"
                    transition={{ type: "spring", stiffness: 380, damping: 34 }}
                  />
                )}
              </Link>
            );
          })}
          <MoreMenu pathname={pathname} />
        </nav>

        <div className="flex items-center gap-4">
          <div
            className="hidden items-center gap-2 pl-4 whitespace-nowrap xl:flex"
            aria-label="Current time in India"
          >
            <time className="font-mono text-sm font-medium tracking-tight text-foreground/70">
              {time}
            </time>
          </div>

          <Button asChild className="hidden sm:inline-flex">
            <SmartLink href={joinHref}>
              Join {site.short} <ArrowUpRight />
            </SmartLink>
          </Button>

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="lg:hidden" aria-label="Open menu">
                <Menu />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full max-w-sm overflow-y-auto p-0">
              <div className="h-[3px] w-full gold-gradient" aria-hidden />
              <SheetHeader className="px-6 pt-6">
                <SheetTitle className="font-serif text-2xl">{site.name}</SheetTitle>
                <SheetDescription>{site.tagline}</SheetDescription>
              </SheetHeader>
              <nav aria-label="Mobile" className="flex flex-col px-6">
                {nav.map((item, i) => (
                  <motion.div
                    key={item.href}
                    initial={{ opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.05 + i * 0.04 }}
                  >
                    <Link
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className={cn(
                        "flex items-center justify-between border-b py-4 font-serif text-2xl",
                        isActive(pathname, item.href) ? "text-ink" : "text-foreground/60",
                      )}
                    >
                      {item.label}
                      {isActive(pathname, item.href) && (
                        <span className="size-1.5 rounded-full bg-gold" />
                      )}
                    </Link>
                  </motion.div>
                ))}
                <p className="mt-6 mb-1 text-[11px] font-semibold tracking-[0.22em] text-muted-foreground uppercase">
                  More
                </p>
                {navMore.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex items-center justify-between border-b py-3 font-serif text-xl",
                      isActive(pathname, item.href) ? "text-ink" : "text-foreground/60",
                    )}
                  >
                    {item.label}
                    {isActive(pathname, item.href) && (
                      <span className="size-1.5 rounded-full bg-gold" />
                    )}
                  </Link>
                ))}
              </nav>
              <div className="mt-auto p-6">
                <Button asChild className="w-full" size="lg">
                  <SmartLink href={joinHref} onClick={() => setOpen(false)}>
                    Join {site.short} <ArrowUpRight />
                  </SmartLink>
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}

/** Less-visited pages, tucked under "More" to keep the bar short. */
function MoreMenu({ pathname }: { pathname: string }) {
  const active = navMore.some((item) => isActive(pathname, item.href));
  return (
    <DropdownMenu.Root modal={false}>
      <DropdownMenu.Trigger
        className={cn(
          "group relative inline-flex items-center gap-1 px-2 py-2 text-sm font-medium whitespace-nowrap outline-none transition-colors focus-visible:text-ink xl:px-3",
          active ? "text-ink" : "text-foreground/60 hover:text-ink data-[state=open]:text-ink",
        )}
      >
        More
        <ChevronDown className="size-3.5 transition-transform duration-200 group-data-[state=open]:rotate-180" />
        {active && (
          <motion.span
            layoutId="nav-underline"
            className="absolute inset-x-2 -bottom-px h-[2px] gold-gradient xl:inset-x-3"
            transition={{ type: "spring", stiffness: 380, damping: 34 }}
          />
        )}
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={10}
          className="z-50 w-72 origin-(--radix-dropdown-menu-content-transform-origin) overflow-hidden rounded-xl border bg-white p-1.5 shadow-[0_24px_60px_-30px_rgba(0,0,0,0.45)] data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95"
        >
          <div className="mb-1 h-[2px] rounded-full gold-gradient" aria-hidden />
          {navMore.map((item) => (
            <DropdownMenu.Item key={item.href} asChild>
              <Link
                href={item.href}
                className={cn(
                  "flex flex-col rounded-lg px-3 py-2.5 outline-none transition-colors data-[highlighted]:bg-paper",
                  isActive(pathname, item.href) && "bg-paper",
                )}
              >
                <span className="flex items-center gap-2 text-sm font-medium text-ink">
                  {item.label}
                  {isActive(pathname, item.href) && (
                    <span className="size-1.5 rounded-full bg-gold" />
                  )}
                </span>
                <span className="text-xs text-muted-foreground">{item.description}</span>
              </Link>
            </DropdownMenu.Item>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
