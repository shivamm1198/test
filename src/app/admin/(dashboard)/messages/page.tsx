import type { Metadata } from "next";
import { ShieldAlert } from "lucide-react";

import { getAdminSession } from "@/lib/content/admin";
import { AdminPageHeader } from "@/components/admin/page-header";
import { MessagesManager, type ContactMessage } from "@/components/admin/messages-manager";

export const metadata: Metadata = { title: "Messages" };

export default async function MessagesPage() {
  const { supabase, role } = await getAdminSession();
  if (role !== "president") {
    return (
      <>
        <AdminPageHeader eyebrow="Dashboard" title="Messages" />
        <div className="p-5 sm:p-8">
          <div className="flex max-w-xl items-start gap-3 rounded-xl border bg-white p-6 text-sm text-muted-foreground">
            <ShieldAlert className="size-5 shrink-0 text-gold" />
            Contact form messages are visible to the president only.
          </div>
        </div>
      </>
    );
  }

  const { data, error } = await supabase
    .from("contact_messages")
    .select("id, topic, name, email, phone, organisation, message, read_at, archived, created_at")
    .order("created_at", { ascending: false })
    .limit(1000);

  return (
    <MessagesManager
      messages={(data ?? []) as ContactMessage[]}
      loadError={
        error
          ? "Messages aren't set up yet. Run supabase/contact-messages.sql in the Supabase SQL Editor."
          : undefined
      }
    />
  );
}
