import { Suspense } from "react";
import { Loader2 } from "lucide-react";

import { requireAdminPage } from "@/lib/content/admin";
import { getContent } from "@/lib/content/queries";
import { AdminSidebar } from "@/components/admin/sidebar";
import { NotAuthorized } from "@/components/admin/not-authorized";

export default function DashboardLayout({ children }: LayoutProps<"/admin">) {
  return (
    <Suspense fallback={<ShellFallback />}>
      <AdminShell>{children}</AdminShell>
    </Suspense>
  );
}

async function AdminShell({ children }: { children: React.ReactNode }) {
  const [{ user, isAdmin, role, supabase }, { site }] = await Promise.all([
    requireAdminPage(),
    getContent(),
  ]);
  if (!isAdmin) return <NotAuthorized email={user!.email} />;

  // Only the president can read contact messages, so only they get the unread badge.
  const unread =
    role === "president"
      ? ((
          await supabase
            .from("contact_messages")
            .select("id", { count: "exact", head: true })
            .is("read_at", null)
            .eq("archived", false)
        ).count ?? 0)
      : 0;

  return (
    <div className="flex min-h-dvh flex-col lg:flex-row">
      <AdminSidebar
        email={user!.email}
        logo={site.logo}
        role={role ?? "coordinator"}
        unread={unread}
      />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}

function ShellFallback() {
  return (
    <div className="grid min-h-dvh place-items-center text-muted-foreground">
      <Loader2 className="size-6 animate-spin" aria-label="Loading dashboard" />
    </div>
  );
}
