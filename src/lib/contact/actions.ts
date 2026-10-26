"use server";

import { z } from "zod";

import { createPublicClient } from "@/lib/supabase/public";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { contactTopics } from "./topics";

export type ContactState = {
  sent?: boolean;
  error?: string;
  fieldErrors?: Partial<Record<"name" | "email" | "message", string>>;
};

const schema = z.object({
  topic: z.enum(contactTopics.map((t) => t.value) as [string, ...string[]]).catch("general"),
  name: z.string().trim().min(2, "Please enter your name.").max(120, "That name is too long."),
  email: z.email("Please enter a valid email.").max(254),
  phone: z.string().trim().max(40).default(""),
  organisation: z.string().trim().max(200).default(""),
  message: z
    .string()
    .trim()
    .min(10, "Tell us a little more (10+ characters).")
    .max(5000, "Please keep your message under 5,000 characters."),
});

/** Stores a contact-form message for the president's Messages dashboard. */
export async function sendContactMessage(
  _prev: ContactState,
  form: FormData,
): Promise<ContactState> {
  // Bots fill in every field, including this hidden one; pretend it worked.
  if (String(form.get("website") ?? "")) return { sent: true };

  const parsed = schema.safeParse({
    topic: form.get("subject"),
    name: form.get("name"),
    email: String(form.get("email") ?? "").trim(),
    phone: form.get("phone") ?? "",
    organisation: form.get("org") ?? "",
    message: form.get("message"),
  });
  if (!parsed.success) {
    const fieldErrors: ContactState["fieldErrors"] = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0];
      if ((key === "name" || key === "email" || key === "message") && !fieldErrors[key]) {
        fieldErrors[key] = issue.message;
      }
    }
    return {
      fieldErrors,
      error: Object.keys(fieldErrors).length ? undefined : "Please check the form.",
    };
  }

  if (!isSupabaseConfigured) {
    return { error: "Messages can't be sent from this preview site yet. Please email us instead." };
  }
  const { error } = await createPublicClient().rpc("submit_contact_message", parsed.data);
  if (error) {
    console.error("[contact] Could not save message:", error.message);
    return {
      error: /several messages|valid email/i.test(error.message)
        ? error.message
        : "Sorry, your message couldn't be sent right now. Please try again, or email us instead.",
    };
  }
  return { sent: true };
}
