"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { mapSupabaseAuthError } from "@/features/auth/errors";
import { validateCredentials } from "@/features/auth/validation";
import type { CredentialErrors } from "@/features/auth/validation";
import { createAppUrl } from "@/lib/app-url";
import { createErrorPayload, type AppErrorPayload } from "@/lib/errors/catalog";
import { createClient } from "@/lib/supabase/server";

export type AuthActionState =
  | { status: "idle" }
  | {
      error: AppErrorPayload;
      fieldErrors?: CredentialErrors;
      status: "error";
    }
  | { message: string; status: "success" };

export async function signIn(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const result = validateCredentials(formData, "sign-in");

  if (!result.valid) {
    return {
      error: createErrorPayload("validation.form_invalid"),
      fieldErrors: result.errors,
      status: "error",
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(result.credentials);

  if (error) {
    return {
      error: mapSupabaseAuthError(error),
      status: "error",
    };
  }

  revalidatePath("/", "layout");
  redirect("/account");
}

export async function signUp(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const result = validateCredentials(formData, "sign-up");

  if (!result.valid) {
    return {
      error: createErrorPayload("validation.form_invalid"),
      fieldErrors: result.errors,
      status: "error",
    };
  }

  const confirmationUrl = createAppUrl("/auth/confirm");
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    ...result.credentials,
    options: {
      emailRedirectTo: confirmationUrl.toString(),
    },
  });

  if (error) {
    return {
      error: mapSupabaseAuthError(error),
      status: "error",
    };
  }

  if (data.session) {
    revalidatePath("/", "layout");
    redirect("/account");
  }

  return {
    message: "Check your inbox and follow the confirmation link to continue.",
    status: "success",
  };
}

export async function signInWithGoogle() {
  const callbackUrl = createAppUrl("/auth/callback");
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: callbackUrl.toString(),
    },
  });

  if (error || !data.url) {
    const payload = createErrorPayload("auth.oauth_start_failed");
    const params = new URLSearchParams({
      error: payload.code,
      mode: "sign-in",
    });

    redirect(`/login?${params.toString()}`);
  }

  redirect(data.url);
}
