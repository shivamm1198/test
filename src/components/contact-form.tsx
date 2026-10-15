"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, Send } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export const subjects = [
  { value: "membership", label: "Become a member" },
  { value: "internship", label: "Internships" },
  { value: "internship-listing", label: "List an internship" },
  { value: "scholarship", label: "Scholarships" },
  { value: "sponsor", label: "Sponsor a student" },
  { value: "chapter", label: "Start a state / campus chapter" },
  { value: "leadership", label: "Campus / Court Leadership" },
  { value: "donation", label: "Donations" },
  { value: "volunteer", label: "Volunteer with a wing" },
  { value: "media", label: "Media & partnerships" },
  { value: "general", label: "General enquiry" },
];

type Errors = Partial<Record<"name" | "email" | "message", string>>;

/**
 * Contact form with client-side validation. There is no backend yet, so a
 * valid submission opens the visitor's mail app addressed to VES.
 */
export function ContactForm({ initialSubject, email }: { initialSubject?: string; email: string }) {
  const resolved = initialSubject?.startsWith("wing-") ? "volunteer" : initialSubject;
  const [subject, setSubject] = React.useState(
    subjects.some((s) => s.value === resolved) ? resolved! : "general",
  );
  const [errors, setErrors] = React.useState<Errors>({});
  const [sent, setSent] = React.useState(false);

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const name = String(data.get("name") ?? "").trim();
    const email = String(data.get("email") ?? "").trim();
    const message = String(data.get("message") ?? "").trim();

    const next: Errors = {};
    if (name.length < 2) next.name = "Please enter your name.";
    if (!/^\S+@\S+\.\S+$/.test(email)) next.email = "Please enter a valid email.";
    if (message.length < 10) next.message = "Tell us a little more (10+ characters).";
    setErrors(next);
    if (Object.keys(next).length) return;

    const label = subjects.find((s) => s.value === subject)?.label ?? "Enquiry";
    const body = [
      `Name: ${name}`,
      `Email: ${email}`,
      `Phone: ${data.get("phone") || "—"}`,
      `Organisation / College: ${data.get("org") || "—"}`,
      "",
      message,
    ].join("\n");
    window.location.href = `mailto:${email}?subject=${encodeURIComponent(
      `[${label}] ${name}`,
    )}&body=${encodeURIComponent(body)}`;
    setSent(true);
  };

  return (
    <div className="relative overflow-hidden rounded-xl border bg-white p-6 shadow-[0_30px_80px_-50px_rgba(0,0,0,0.4)] sm:p-10">
      <div className="absolute inset-x-0 top-0 h-[3px] gold-gradient" aria-hidden />
      <AnimatePresence mode="wait" initial={false}>
        {sent ? (
          <motion.div
            key="sent"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex min-h-[420px] flex-col items-center justify-center gap-4 text-center"
          >
            <CheckCircle2 className="size-12 text-gold" strokeWidth={1.3} />
            <h2 className="text-3xl font-semibold text-ink">Thank you</h2>
            <p className="max-w-sm text-muted-foreground">
              Your mail app should have opened with your message to{" "}
              <span className="font-medium text-ink">{email}</span>. Hit send and we&apos;ll reply
              within two working days.
            </p>
            <Button variant="outline" onClick={() => setSent(false)} className="mt-2">
              Write another message
            </Button>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onSubmit={onSubmit}
            noValidate
            className="grid gap-6"
          >
            <div>
              <h2 className="text-3xl font-semibold text-ink">Send us a message</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Fields marked <span className="text-gold-dark">*</span> are required.
              </p>
            </div>

            <fieldset className="grid gap-2">
              <legend className="mb-2 text-sm font-medium">I&apos;m writing about</legend>
              <div className="flex flex-wrap gap-2">
                {subjects.map((s) => (
                  <label
                    key={s.value}
                    className="cursor-pointer rounded-full border px-3.5 py-1.5 text-sm text-foreground/70 transition-colors hover:border-foreground/40 has-[:checked]:border-ink has-[:checked]:bg-ink has-[:checked]:text-white has-[:focus-visible]:ring-[3px] has-[:focus-visible]:ring-ring/40"
                  >
                    <input
                      type="radio"
                      name="subject"
                      value={s.value}
                      checked={subject === s.value}
                      onChange={() => setSubject(s.value)}
                      className="sr-only"
                    />
                    {s.label}
                  </label>
                ))}
              </div>
            </fieldset>

            <div className="grid gap-6 sm:grid-cols-2">
              <Field
                label="Full name"
                name="name"
                required
                error={errors.name}
                autoComplete="name"
              />
              <Field
                label="Email"
                name="email"
                type="email"
                required
                error={errors.email}
                autoComplete="email"
              />
              <Field label="Phone" name="phone" type="tel" autoComplete="tel" />
              <Field label="College / Organisation" name="org" />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="message">
                Message <span className="text-gold-dark">*</span>
              </Label>
              <Textarea
                id="message"
                name="message"
                rows={5}
                aria-invalid={!!errors.message}
                aria-describedby={errors.message ? "message-error" : undefined}
                placeholder="How can we help?"
              />
              <FieldError id="message-error" message={errors.message} />
            </div>

            <Button type="submit" size="lg" className="w-full sm:w-fit">
              Send message <Send />
            </Button>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}

function Field({
  label,
  name,
  required,
  error,
  ...props
}: { label: string; name: string; error?: string } & React.ComponentProps<"input">) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={name}>
        {label} {required && <span className="text-gold-dark">*</span>}
      </Label>
      <Input
        id={name}
        name={name}
        aria-invalid={!!error}
        aria-describedby={error ? `${name}-error` : undefined}
        {...props}
      />
      <FieldError id={`${name}-error`} message={error} />
    </div>
  );
}

function FieldError({ id, message }: { id: string; message?: string }) {
  return (
    <AnimatePresence>
      {message && (
        <motion.p
          id={id}
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="text-xs text-destructive"
        >
          {message}
        </motion.p>
      )}
    </AnimatePresence>
  );
}
