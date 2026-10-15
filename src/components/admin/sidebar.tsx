"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowUpRight,
  CalendarDays,
  GraduationCap,
  IdCard,
  Images,
  LayoutDashboard,
  LogOut,
  Menu,
  NotebookPen,
  PenSquare,
  UsersRound,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { signOut } from "@/lib/admin/auth-actions";
import { BrandMark } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

export const adminNav = [
  { href: "/admin", label: "Overview", Icon: LayoutDashboard },
  { href: "/admin/content", label: "Homepage editor", Icon: PenSquare },
  { href: "/admin/events", label: "Events", Icon: CalendarDays },
  { href: "/admin/gallery", label: "Gallery", Icon: Images },
  { href: "/admin/journal", label: "Student Journal", Icon: NotebookPen },
  { href: "/admin/registry", label: "Registered members", Icon: IdCard },
  { href: "/admin/team", label: "Team", Icon: UsersRound, presidentOnly: true },
  { href: "/portal", label: "Internship portal", Icon: GraduationCap, presidentOnly: true },
];

function isActive(pathname: string, href: string) {
  return href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
}

type SidebarProps = { email: string; logo: string; role: "president" | "coordinator" };

export function AdminSidebar({ email, logo, role }: SidebarProps) {
  const [open, setOpen] = React.useState(false);

  return (
    <>
      {/* Mobile top bar */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b bg-ink px-4 py-3 text-white lg:hidden">
        <Link href="/admin" className="flex items-center gap-2.5">
          <BrandMark logo={logo} name="Organisation" inverse className="size-8" />
          <span className="font-serif text-lg">VES Dashboard</span>
        </Link>
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/10 hover:text-white"
              aria-label="Open menu"
            >
              <Menu />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 border-0 bg-ink p-0 text-white">
            <SheetTitle className="sr-only">Dashboard menu</SheetTitle>
            <SidebarBody email={email} logo={logo} role={role} onNavigate={() => setOpen(false)} />
          </SheetContent>
        </Sheet>
      </header>

      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 bg-ink text-white lg:block">
        <SidebarBody email={email} logo={logo} role={role} />
      </aside>
    </>
  );
}

function SidebarBody({
  email,
  logo,
  role,
  onNavigate,
}: SidebarProps & { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col">
      <div className="h-[3px] gold-gradient" />
      <Link href="/admin" onClick={onNavigate} className="flex items-center gap-3 px-6 pt-7 pb-8">
        <BrandMark logo={logo} name="Organisation" inverse />
        <span className="leading-tight">
          <span className="block font-serif text-xl">Vidhi Ekta Sngh</span>
          <span className="text-[11px] tracking-[0.2em] text-gold-light uppercase">Dashboard</span>
        </span>
      </Link>

      <nav aria-label="Dashboard" className="flex flex-col gap-1 px-3">
        {adminNav
          .filter((item) => role === "president" || !item.presidentOnly)
          .map(({ href, label, Icon }) => {
            const active = isActive(pathname, href);
            return (
              <Link
                key={href}
                href={href}
                onClick={onNavigate}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors",
                  active ? "text-white" : "text-white/55 hover:bg-white/5 hover:text-white",
                )}
              >
                {active && (
                  <motion.span
                    layoutId="admin-nav"
                    className="absolute inset-0 rounded-md bg-white/10"
                    transition={{ type: "spring", stiffness: 400, damping: 36 }}
                  />
                )}
                {active && (
                  <span className="absolute top-2 bottom-2 left-0 w-[2px] rounded gold-gradient" />
                )}
                <Icon className={cn("relative size-4", active && "text-gold-light")} />
                <span className="relative">{label}</span>
              </Link>
            );
          })}
      </nav>

      <div className="mt-auto flex flex-col gap-1 border-t border-white/10 p-3">
        <a
          href="/"
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm text-white/55 transition-colors hover:bg-white/5 hover:text-white"
        >
          <ArrowUpRight className="size-4" /> View website
        </a>
        <form action={signOut}>
          <button
            type="submit"
            className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm text-white/55 transition-colors hover:bg-white/5 hover:text-white"
          >
            <LogOut className="size-4" /> Sign out
          </button>
        </form>
        <p className="px-3 pt-2 text-[10px] font-semibold tracking-[0.2em] text-gold-light/70 uppercase">
          {role === "president" ? "President" : "Coordinator"}
        </p>
        <p className="truncate px-3 text-xs text-white/35" title={email}>
          {email}
        </p>
      </div>
    </div>
  );
}
