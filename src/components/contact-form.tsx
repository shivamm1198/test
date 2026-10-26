"use client";

import * as React from "react";
import { useActionState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, CheckCircle2, Loader2, Send } from "lucide-react";

import { sendContactMessage, type ContactState } from "@/lib/contact/actions";
import { contactTopics } from "@/lib/contact/topics";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export const subjects = contactTopics;

type Errors = NonNullable<ContactState["fieldErrors"]>;

/**
 * Contact form. Messages are saved to Supabase and appear in the president's
 * Messages dashboard (/admin/messages).
 */
export function ContactForm({ initialSubject, email }: { initialSubject?: string; email: string }) {
  // Remounting the form clears it after "Write another message".
  const [round, setRound] = React.useState(0);
  return (
    <div className="relative overflow-hidden rounded-xl border bg-white p-6 shadow-[0_30px_80px_-50px_rgba(0,0,0,0.4)] sm:p-10">
      <div className="absolute inset-x-0 top-0 h-[3px] gold-gradient" aria-hidden />
      <ContactFormBody
        key={round}
        initialSubject={initialSubject}
        email={email}
        onAgain={() => setRound((r) => r + 1)}
      />
    </div>
  );
}

function ContactFormBody({
  initialSubject,
  email,
  onAgain,
}: {
  initialSubject?: string;
  email: string;
  onAgain: () => void;
}) {
  const resolved = initialSubject?.startsWith("wing-") ? "volunteer" : initialSubject;
  const [subject, setSubject] = React.useState<string>(
    subjects.some((s) => s.value === resolved) ? resolved! : "general",
  );
  const [state, formAction, pending] = useActionState(sendContactMessage, {});
  const [clientErrors, setClientErrors] = React.useState<Errors>({});
  const errors: Errors = { ...state.fieldErrors, ...clientErrors };
  const [senderEmail, setSenderEmail] = React.useState("");
  const thanks = React.useRef<HTMLDivElement>(null);

  // The thank-you panel is shorter than the form: bring it into view.
  React.useEffect(() => {
    if (state.sent) thanks.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [state.sent]);

  // Quick checks in the browser; the server checks everything again.
  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    const data = new FormData(e.currentTarget);
    const name = String(data.get("name") ?? "").trim();
    const from = String(data.get("email") ?? "").trim();
    const message = String(data.get("message") ?? "").trim();
    const next: Errors = {};
    if (name.length < 2) next.name = "Please enter your name.";
    if (!/^\S+@\S+\.\S+$/.test(from)) next.email = "Please enter a valid email.";
    if (message.length < 10) next.message = "Tell us a little more (10+ characters).";
    // Submitting by hand (not via the form's action) keeps what was typed if sending fails.
    e.preventDefault();
    setClientErrors(next);
    setSenderEmail(from);
    if (Object.keys(next).length) return;
    React.startTransition(() => formAction(data));
  };

  return (
    <AnimatePresence mode="wait" initial={false}>
      {state.sent ? (
        <motion.div
          key="sent"
          ref={thanks}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="flex min-h-[420px] flex-col items-center justify-center gap-4 text-center"
        >
          <CheckCircle2 className="size-12 text-gold" strokeWidth={1.3} />
          <h2 className="text-3xl font-semibold text-ink">Thank you</h2>
          <p className="max-w-sm text-muted-foreground">
            Your message has reached us. We&apos;ll reply
            {senderEmail && (
              <>
                {" "}
                to <span className="font-medium text-ink">{senderEmail}</span>
              </>
            )}{" "}
            within two working days.
          </p>
          <Button variant="outline" onClick={onAgain} className="mt-2">
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
            <Field label="Full name" name="name" required error={errors.name} autoComplete="name" />
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
              maxLength={5000}
              aria-invalid={!!errors.message}
              aria-describedby={errors.message ? "message-error" : undefined}
              placeholder="How can we help?"
            />
            <FieldError id="message-error" message={errors.message} />
          </div>

          {/* Left empty by people; bots fill it in. */}
          <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
            <label>
              Website
              <input type="text" name="website" tabIndex={-1} autoComplete="off" />
            </label>
          </div>

          {state.error && (
            <p
              role="alert"
              className="flex items-start gap-2 rounded-md border border-destructive/20 bg-destructive/5 px-3 py-2.5 text-sm text-destructive"
            >
              <AlertCircle className="mt-0.5 size-4 shrink-0" />
              <span>
                {state.error}{" "}
                <a href={`mailto:${email}`} className="font-medium underline underline-offset-2">
                  {email}
                </a>
              </span>
            </p>
          )}

          <Button type="submit" size="lg" className="w-full sm:w-fit" disabled={pending}>
            {pending ? (
              <>
                Sending… <Loader2 className="animate-spin" />
              </>
            ) : (
              <>
                Send message <Send />
              </>
            )}
          </Button>
        </motion.form>
      )}
    </AnimatePresence>
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
