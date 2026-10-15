"use client";

import * as React from "react";
import { useActionState } from "react";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";
import {
  joinAsCurrentUser,
  joinWithExistingAccount,
  joinWithNewAccount,
  portalSignIn,
  portalSignOut,
  type PortalAuthState,
} from "@/lib/portal/auth-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function Field({ label, ...props }: { label: string } & React.ComponentProps<"input">) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={props.id}>{label}</Label>
      <Input {...props} />
    </div>
  );
}

function Messages({ state }: { state: PortalAuthState }) {
  return (
    <>
      {state.error && (
        <p
          role="alert"
          className="flex items-start gap-2 rounded-md border border-destructive/20 bg-destructive/5 px-3 py-2.5 text-sm text-destructive"
        >
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          {state.error}
        </p>
      )}
      {state.notice && (
        <p
          role="status"
          className="flex items-start gap-2 rounded-md border border-gold/30 bg-gold/5 px-3 py-2.5 text-sm text-gold-dark"
        >
          <CheckCircle2 className="mt-0.5 size-4 shrink-0" />
          {state.notice}
        </p>
      )}
    </>
  );
}

function Submit({ pending, children }: { pending: boolean; children: React.ReactNode }) {
  return (
    <Button type="submit" size="lg" disabled={pending} className="mt-1">
      {pending && <Loader2 className="animate-spin" />}
      {children}
    </Button>
  );
}

export function PortalLoginForm({ next, linkError }: { next?: string; linkError?: boolean }) {
  const [state, action, pending] = useActionState(portalSignIn, {
    error: linkError ? "That link has expired or was already used. Please sign in." : undefined,
  });
  return (
    <form action={action} className="mt-8 grid gap-5">
      <input type="hidden" name="next" value={next ?? "/portal"} />
      <Field
        label="Email"
        id="email"
        name="email"
        type="email"
        autoComplete="email"
        defaultValue={state.email}
        required
        autoFocus
      />
      <Field
        label="Password"
        id="password"
        name="password"
        type="password"
        autoComplete="current-password"
        required
      />
      <Messages state={state} />
      <Submit pending={pending}>{pending ? "Signing in…" : "Sign in"}</Submit>
    </form>
  );
}

type AuthAction = (prev: PortalAuthState, form: FormData) => Promise<PortalAuthState>;

/** The Server Actions behind the invite forms (portal by default, or the dashboard team). */
export type JoinActions = {
  current: AuthAction;
  create: AuthAction;
  existing: AuthAction;
  signOut: () => Promise<void>;
};

const portalJoinActions: JoinActions = {
  current: joinAsCurrentUser,
  create: joinWithNewAccount,
  existing: joinWithExistingAccount,
  signOut: portalSignOut,
};

/** Invite page: join with the current account, a new account, or an existing one. */
export function JoinForms({
  token,
  signedInAs,
  roleLabel,
  actions = portalJoinActions,
}: {
  token: string;
  signedInAs: string | null;
  roleLabel: string;
  actions?: JoinActions;
}) {
  const [mode, setMode] = React.useState<"new" | "existing">("new");
  const [current, currentAction, currentPending] = useActionState(actions.current, {});
  const [created, createAction, createPending] = useActionState(actions.create, {});
  const [existing, existingAction, existingPending] = useActionState(actions.existing, {});

  if (signedInAs) {
    return (
      <div className="mt-8 grid gap-5">
        <form action={currentAction} className="grid gap-5">
          <input type="hidden" name="token" value={token} />
          <p className="rounded-md bg-paper px-3 py-2.5 text-sm">
            Signed in as <span className="font-medium text-ink">{signedInAs}</span>
          </p>
          <Field label="Your full name" id="name" name="name" autoComplete="name" required />
          <Messages state={current} />
          <Submit pending={currentPending}>Join as {roleLabel}</Submit>
        </form>
        <form action={actions.signOut}>
          <button
            type="submit"
            className="text-sm text-muted-foreground underline-offset-4 hover:text-ink hover:underline"
          >
            Not you? Sign out
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="mt-8">
      <div role="tablist" className="grid grid-cols-2 rounded-lg bg-muted p-1 text-sm">
        {(
          [
            ["new", "Create an account"],
            ["existing", "I already have an account"],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={mode === key}
            onClick={() => setMode(key)}
            className={cn(
              "rounded-md px-3 py-2 font-medium transition-colors",
              mode === key ? "bg-white text-ink shadow-sm" : "text-foreground/60 hover:text-ink",
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {mode === "new" ? (
        <form action={createAction} className="mt-6 grid gap-5">
          <input type="hidden" name="token" value={token} />
          <Field label="Full name" id="name" name="name" autoComplete="name" required />
          <Field
            label="Email"
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            defaultValue={created.email}
            required
          />
          <Field
            label="Choose a password"
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            minLength={8}
            required
          />
          <Messages state={created} />
          <Submit pending={createPending}>Create account & join</Submit>
        </form>
      ) : (
        <form action={existingAction} className="mt-6 grid gap-5">
          <input type="hidden" name="token" value={token} />
          <Field label="Full name" id="name2" name="name" autoComplete="name" />
          <Field
            label="Email"
            id="email2"
            name="email"
            type="email"
            autoComplete="email"
            defaultValue={existing.email}
            required
          />
          <Field
            label="Password"
            id="password2"
            name="password"
            type="password"
            autoComplete="current-password"
            required
          />
          <Messages state={existing} />
          <Submit pending={existingPending}>Sign in & join</Submit>
        </form>
      )}
    </div>
  );
}
