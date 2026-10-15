import type { Metadata } from "next";

import { getAdminSession } from "@/lib/content/admin";
import { fetchRegisteredMembers } from "@/lib/content/queries";
import { RegistryManager } from "@/components/admin/registry-manager";

export const metadata: Metadata = { title: "Registered members" };

export default async function AdminRegistryPage() {
  const { supabase } = await getAdminSession();
  const { members, error } = await fetchRegisteredMembers(supabase);
  return (
    <RegistryManager
      members={members}
      loadError={
        error
          ? error.includes("registered_members")
            ? "The member list isn't set up yet. Run supabase/team-and-registry.sql in the Supabase SQL Editor."
            : error
          : undefined
      }
    />
  );
}
