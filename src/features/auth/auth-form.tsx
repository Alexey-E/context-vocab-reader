"use client";

import { useActionState, useState } from "react";

import { signIn, signInWithGoogle, signUp } from "@/app/login/actions";
import type { AuthActionState } from "@/app/login/actions";
import { AUTH_FIELD_LIMITS } from "@/features/auth/constants";
import type { AppErrorPayload } from "@/lib/errors/catalog";

type AuthMode = "sign-in" | "sign-up";

const AUTH_MODE_OPTIONS: ReadonlyArray<{
  label: string;
  value: AuthMode;
}> = [
  { label: "Sign in", value: "sign-in" },
  { label: "Create account", value: "sign-up" },
];

type AuthModeContent = Readonly<{
  description: string;
  heading: string;
  passwordAutoComplete: "current-password" | "new-password";
  submitLabel: string;
}>;

const AUTH_MODE_CONTENT: Record<AuthMode, AuthModeContent> = {
  "sign-in": {
    description:
      "Use Google for the fastest demo flow, or continue with email and password.",
    heading: "Welcome back",
    passwordAutoComplete: "current-password",
    submitLabel: "Sign in",
  },
  "sign-up": {
    description: "Create an account to keep documents and vocabulary synced.",
    heading: "Create your account",
    passwordAutoComplete: "new-password",
    submitLabel: "Create account",
  },
};

const initialAuthActionState: AuthActionState = {
  status: "idle",
};

type AuthFormProps = Readonly<{
  initialError?: AppErrorPayload;
  initialMode: AuthMode;
}>;

type AuthFeedbackValue = Readonly<{
  message: string;
  status: "error" | "success";
}>;

function getAuthFeedback(
  state: AuthActionState,
  initialError?: AppErrorPayload,
): AuthFeedbackValue | null {
  if (state.status === "idle") {
    return initialError
      ? { message: initialError.message, status: "error" }
      : null;
  }

  if (state.status === "error") {
    return { message: state.error.message, status: "error" };
  }

  return { message: state.message, status: "success" };
}

function AuthFeedback({ value }: Readonly<{ value: AuthFeedbackValue }>) {
  const error = value.status === "error";

  return (
    <output
      role={error ? "alert" : undefined}
      className={`mb-4 block rounded-xl border px-4 py-3 text-sm leading-5 ${
        error
          ? "border-danger bg-danger-soft text-danger-soft-text"
          : "border-success bg-success-soft text-success-soft-text"
      }`}
    >
      {value.message}
    </output>
  );
}

type PasswordFieldProps = Readonly<{
  error?: AppErrorPayload;
  mode: AuthMode;
}>;

function PasswordField({ error, mode }: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);
  const modeContent = AUTH_MODE_CONTENT[mode];

  return (
    <>
      <label
        htmlFor="password"
        className="mt-5 block text-sm font-semibold text-muted"
      >
        Password
      </label>
      <div className="relative mt-2">
        <input
          id="password"
          name="password"
          type={visible ? "text" : "password"}
          minLength={AUTH_FIELD_LIMITS.password.minLength}
          maxLength={AUTH_FIELD_LIMITS.password.maxLength}
          autoComplete={modeContent.passwordAutoComplete}
          required
          aria-invalid={Boolean(error)}
          aria-describedby={error ? "password-error" : undefined}
          placeholder={`At least ${AUTH_FIELD_LIMITS.password.minLength} characters`}
          className="h-12 w-full rounded-xl border border-border bg-surface px-4 pr-16 text-[15px] text-text outline-none transition placeholder:text-subtle focus:border-primary focus:ring-3 focus:ring-primary/10"
        />
        <button
          type="button"
          onClick={() => setVisible((current) => !current)}
          className="absolute inset-y-0 right-0 cursor-pointer px-4 text-xs font-semibold text-muted hover:text-text focus-visible:outline-2 focus-visible:outline-primary"
          aria-label={visible ? "Hide password" : "Show password"}
        >
          {visible ? "Hide" : "Show"}
        </button>
      </div>
      {error ? (
        <p id="password-error" className="mt-1.5 text-sm text-danger">
          {error.message}
        </p>
      ) : null}
      {mode === "sign-in" ? (
        <p
          className="mt-2 text-right text-xs font-semibold text-subtle"
          title="Password recovery will be added in a later stage."
        >
          Forgot password?
        </p>
      ) : null}
    </>
  );
}

export function AuthForm({ initialError, initialMode }: AuthFormProps) {
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [signInState, signInAction, signInPending] = useActionState(
    signIn,
    initialAuthActionState,
  );
  const [signUpState, signUpAction, signUpPending] = useActionState(
    signUp,
    initialAuthActionState,
  );
  const actionByMode = {
    "sign-in": {
      action: signInAction,
      pending: signInPending,
      state: signInState,
    },
    "sign-up": {
      action: signUpAction,
      pending: signUpPending,
      state: signUpState,
    },
  };
  const { action, pending, state } = actionByMode[mode];
  const modeContent = AUTH_MODE_CONTENT[mode];
  const fieldErrors = state.status === "error" ? state.fieldErrors : undefined;
  const feedback = getAuthFeedback(state, initialError);
  const submitLabel = pending ? "Please wait…" : modeContent.submitLabel;

  return (
    <section className="w-full min-w-0 max-w-full bg-surface sm:max-w-117.5 sm:rounded-[28px] sm:border sm:border-border sm:px-11 sm:py-10 sm:shadow-[0_8px_30px_rgba(15,23,42,0.04)]">
      <p className="text-xs font-bold tracking-[0.16em] text-primary uppercase">
        Authentication
      </p>
      <h1 className="mt-2 text-[30px] leading-tight font-bold tracking-[-0.03em] text-text sm:mt-3 sm:text-[34px]">
        {modeContent.heading}
      </h1>
      <p className="mt-2 wrap-break-word text-sm leading-5 text-muted sm:text-[15px] sm:leading-6">
        {modeContent.description}
      </p>

      <div
        className="mt-6 grid grid-cols-2 rounded-full bg-surface-muted p-1"
        role="tablist"
        aria-label="Authentication mode"
      >
        {AUTH_MODE_OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            role="tab"
            aria-selected={mode === option.value}
            onClick={() => setMode(option.value)}
            className={`min-h-10 cursor-pointer rounded-full border px-3 text-sm font-semibold transition-colors ${
              mode === option.value
                ? "border-border bg-surface text-text shadow-sm"
                : "border-transparent text-muted hover:text-text"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      <form action={action} className="min-w-0">
        <button
          type="submit"
          formAction={signInWithGoogle}
          formNoValidate
          className="mt-5 flex min-h-12 w-full cursor-pointer items-center justify-center gap-3 rounded-xl border border-border-strong bg-surface px-4 text-sm font-semibold text-text transition-colors hover:bg-surface-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary sm:mt-6"
        >
          <span
            aria-hidden="true"
            className="flex size-5 items-center justify-center rounded-full border border-border-strong text-[11px] font-bold text-primary"
          >
            G
          </span>
          <span>Continue with Google</span>
        </button>

        <div className="my-5 flex items-center gap-3 sm:gap-4">
          <span className="h-px flex-1 bg-border" />
          <span className="text-[11px] font-medium text-subtle">
            or continue with email
          </span>
          <span className="h-px flex-1 bg-border" />
        </div>

        {feedback ? <AuthFeedback value={feedback} /> : null}

        <label htmlFor="email" className="text-sm font-semibold text-muted">
          Email address
        </label>
        <input
          id="email"
          name="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          maxLength={AUTH_FIELD_LIMITS.email.maxLength}
          required
          aria-invalid={Boolean(fieldErrors?.email)}
          aria-describedby={fieldErrors?.email ? "email-error" : undefined}
          placeholder="you@example.com"
          className="mt-2 h-12 w-full rounded-xl border border-border bg-surface px-4 text-[15px] text-text outline-none transition placeholder:text-subtle focus:border-primary focus:ring-3 focus:ring-primary/10"
        />
        {fieldErrors?.email ? (
          <p id="email-error" className="mt-1.5 text-sm text-danger">
            {fieldErrors.email.message}
          </p>
        ) : null}

        <PasswordField error={fieldErrors?.password} mode={mode} />

        <button
          type="submit"
          disabled={pending}
          className="mt-5 flex min-h-12 w-full cursor-pointer items-center justify-center rounded-xl bg-primary px-5 text-sm font-semibold text-primary-contrast transition-colors hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-wait disabled:opacity-60"
        >
          {submitLabel}
        </button>
      </form>
    </section>
  );
}
