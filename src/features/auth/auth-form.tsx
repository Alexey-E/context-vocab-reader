"use client";

import { useActionState, useState } from "react";

import { signIn, signInWithGoogle, signUp } from "@/app/login/actions";
import type { AuthActionState } from "@/app/login/actions";
import {
  EMAIL_MAX_LENGTH,
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
} from "@/features/auth/constants";
import type { AppErrorPayload } from "@/lib/errors/catalog";

type AuthMode = "sign-in" | "sign-up";

const initialAuthActionState: AuthActionState = {
  status: "idle",
};

type AuthFormProps = {
  initialError?: AppErrorPayload;
  initialMode: AuthMode;
};

export function AuthForm({ initialError, initialMode }: AuthFormProps) {
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [signInState, signInAction, signInPending] = useActionState(
    signIn,
    initialAuthActionState,
  );
  const [signUpState, signUpAction, signUpPending] = useActionState(
    signUp,
    initialAuthActionState,
  );
  const state = mode === "sign-in" ? signInState : signUpState;
  const pending = mode === "sign-in" ? signInPending : signUpPending;
  const fieldErrors = state.status === "error" ? state.fieldErrors : undefined;
  const message =
    state.status === "idle"
      ? initialError?.message
      : state.status === "error"
        ? state.error.message
        : state.message;
  const messageStatus =
    state.status === "idle" && initialError ? "error" : state.status;

  return (
    <section className="w-full min-w-0 max-w-full bg-white sm:max-w-[470px] sm:rounded-[28px] sm:border sm:border-slate-200 sm:px-11 sm:py-10 sm:shadow-[0_8px_30px_rgba(15,23,42,0.04)]">
      <p className="text-xs font-bold tracking-[0.16em] text-blue-600 uppercase">
        Authentication
      </p>
      <h1 className="mt-2 text-[30px] leading-tight font-bold tracking-[-0.03em] text-slate-900 sm:mt-3 sm:text-[34px]">
        {mode === "sign-in" ? "Welcome back" : "Create your account"}
      </h1>
      <p className="mt-2 break-words text-sm leading-5 text-slate-500 sm:text-[15px] sm:leading-6">
        {mode === "sign-in"
          ? "Use Google for the fastest demo flow, or continue with email and password."
          : "Create an account to keep documents and vocabulary synced."}
      </p>

      <div
        className="mt-6 grid grid-cols-2 rounded-full bg-slate-100 p-1"
        role="tablist"
        aria-label="Authentication mode"
      >
        <button
          type="button"
          role="tab"
          aria-selected={mode === "sign-in"}
          onClick={() => setMode("sign-in")}
          className={`min-h-10 cursor-pointer rounded-full border px-3 text-sm font-semibold transition-colors ${
            mode === "sign-in"
              ? "border-slate-200 bg-white text-slate-900 shadow-sm"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          Sign in
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mode === "sign-up"}
          onClick={() => setMode("sign-up")}
          className={`min-h-10 cursor-pointer rounded-full border px-3 text-sm font-semibold transition-colors ${
            mode === "sign-up"
              ? "border-slate-200 bg-white text-slate-900 shadow-sm"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          Create account
        </button>
      </div>

      <form
        action={mode === "sign-in" ? signInAction : signUpAction}
        className="min-w-0"
      >
        <button
          type="submit"
          formAction={signInWithGoogle}
          formNoValidate
          className="mt-5 flex min-h-12 w-full cursor-pointer items-center justify-center gap-3 rounded-xl border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-900 transition-colors hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 sm:mt-6"
        >
          <span
            aria-hidden="true"
            className="flex size-5 items-center justify-center rounded-full border border-slate-300 text-[11px] font-bold text-blue-600"
          >
            G
          </span>
          Continue with Google
        </button>

        <div className="my-5 flex items-center gap-3 sm:gap-4">
          <span className="h-px flex-1 bg-slate-200" />
          <span className="text-[11px] font-medium text-slate-400">
            or continue with email
          </span>
          <span className="h-px flex-1 bg-slate-200" />
        </div>

        {message ? (
          <div
            role={messageStatus === "error" ? "alert" : "status"}
            className={`mb-4 rounded-xl border px-4 py-3 text-sm leading-5 ${
              messageStatus === "error"
                ? "border-red-200 bg-red-50 text-red-700"
                : "border-emerald-200 bg-emerald-50 text-emerald-700"
            }`}
          >
            {message}
          </div>
        ) : null}

        <label htmlFor="email" className="text-sm font-semibold text-slate-700">
          Email address
        </label>
        <input
          id="email"
          name="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          maxLength={EMAIL_MAX_LENGTH}
          required
          aria-invalid={Boolean(fieldErrors?.email)}
          aria-describedby={fieldErrors?.email ? "email-error" : undefined}
          placeholder="you@example.com"
          className="mt-2 h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-[15px] text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:ring-3 focus:ring-blue-600/10"
        />
        {fieldErrors?.email ? (
          <p id="email-error" className="mt-1.5 text-sm text-red-600">
            {fieldErrors.email.message}
          </p>
        ) : null}

        <label
          htmlFor="password"
          className="mt-5 block text-sm font-semibold text-slate-700"
        >
          Password
        </label>
        <div className="relative mt-2">
          <input
            id="password"
            name="password"
            type={passwordVisible ? "text" : "password"}
            minLength={PASSWORD_MIN_LENGTH}
            maxLength={PASSWORD_MAX_LENGTH}
            autoComplete={
              mode === "sign-in" ? "current-password" : "new-password"
            }
            required
            aria-invalid={Boolean(fieldErrors?.password)}
            aria-describedby={
              fieldErrors?.password ? "password-error" : undefined
            }
            placeholder={`At least ${PASSWORD_MIN_LENGTH} characters`}
            className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 pr-16 text-[15px] text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:ring-3 focus:ring-blue-600/10"
          />
          <button
            type="button"
            onClick={() => setPasswordVisible((visible) => !visible)}
            className="absolute inset-y-0 right-0 cursor-pointer px-4 text-xs font-semibold text-slate-500 hover:text-slate-800 focus-visible:outline-2 focus-visible:outline-blue-600"
            aria-label={passwordVisible ? "Hide password" : "Show password"}
          >
            {passwordVisible ? "Hide" : "Show"}
          </button>
        </div>
        {fieldErrors?.password ? (
          <p id="password-error" className="mt-1.5 text-sm text-red-600">
            {fieldErrors.password.message}
          </p>
        ) : null}
        {mode === "sign-in" ? (
          <p
            className="mt-2 text-right text-xs font-semibold text-slate-400"
            title="Password recovery will be added in a later stage."
          >
            Forgot password?
          </p>
        ) : null}

        <button
          type="submit"
          disabled={pending}
          className="mt-5 flex min-h-12 w-full cursor-pointer items-center justify-center rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:cursor-wait disabled:opacity-60"
        >
          {pending
            ? "Please wait…"
            : mode === "sign-in"
              ? "Sign in"
              : "Create account"}
        </button>
      </form>
    </section>
  );
}
