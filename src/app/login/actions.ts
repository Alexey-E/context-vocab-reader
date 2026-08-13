"use server";

import { revalidatePath } from "next/cache";
import { redirect as nextRedirect } from "next/navigation";
import { getTranslations } from "next-intl/server";

import { mapSupabaseAuthError } from "@/features/auth/errors";
import { validateCredentials } from "@/features/auth/validation";
import { createAppUrl } from "@/lib/app-url";
import type { Credentials } from "@/features/auth/validation";
import { redirect } from "@/i18n/navigation";
import { parseAppLocale, type AppLocale } from "@/i18n/routing";
import type { AppErrorPayload } from "@/lib/errors/catalog";
import { createErrorPayload, localizeFieldErrors } from "@/lib/errors/localize";
import { createClient } from "@/lib/supabase/server";

type CredentialFieldErrors = Partial<
  Record<keyof Credentials, AppErrorPayload>
>;

export type AuthActionState =
  | { status: "idle" }
  | {
      error: AppErrorPayload;
      fieldErrors?: CredentialFieldErrors;
      status: "error";
    }
  | { message: string; status: "success" };

export async function signIn(
  actionLocale: AppLocale,
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const locale = parseAppLocale(actionLocale);
  const result = validateCredentials(formData, "sign-in");

  if (!result.valid) {
    return {
      error: await createErrorPayload("validation.form_invalid", locale),
      fieldErrors: await localizeFieldErrors(result.errors, locale),
      status: "error",
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(result.credentials);

  if (error) {
    return {
      error: await createErrorPayload(mapSupabaseAuthError(error), locale),
      status: "error",
    };
  }

  revalidatePath("/", "layout");
  return redirect({ href: "/account", locale });
}

export async function signUp(
  actionLocale: AppLocale,
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const locale = parseAppLocale(actionLocale);
  const result = validateCredentials(formData, "sign-up");

  if (!result.valid) {
    return {
      error: await createErrorPayload("validation.form_invalid", locale),
      fieldErrors: await localizeFieldErrors(result.errors, locale),
      status: "error",
    };
  }

  const confirmationUrl = createAppUrl("/auth/confirm");
  confirmationUrl.searchParams.set("locale", locale);
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    ...result.credentials,
    options: {
      emailRedirectTo: confirmationUrl.toString(),
    },
  });

  if (error) {
    return {
      error: await createErrorPayload(mapSupabaseAuthError(error), locale),
      status: "error",
    };
  }

  if (data.session) {
    revalidatePath("/", "layout");
    redirect({ href: "/account", locale });
  }

  const t = await getTranslations({ locale, namespace: "Auth" });

  return {
    message: t("signUp.success"),
    status: "success",
  };
}

export async function signInWithGoogle(
  actionLocale: AppLocale,
  _formData: FormData,
) {
  void _formData;

  const locale = parseAppLocale(actionLocale);
  const callbackUrl = createAppUrl("/auth/callback");
  callbackUrl.searchParams.set("locale", locale);
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: callbackUrl.toString(),
    },
  });

  if (error || !data.url) {
    const payload = await createErrorPayload("auth.oauth_start_failed", locale);
    const params = new URLSearchParams({
      error: payload.code,
      mode: "sign-in",
    });

    return redirect({ href: `/login?${params.toString()}`, locale });
  }

  return nextRedirect(data.url);
}
