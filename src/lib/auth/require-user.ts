import "server-only";

import { getLocale } from "next-intl/server";
import { cache } from "react";

import { redirect } from "@/i18n/navigation";
import type { AppLocale } from "@/i18n/routing";
import { createClient } from "@/lib/supabase/server";

export const getAuthContext = cache(async () => {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();
  const claims = data?.claims;
  const userId = !error && typeof claims?.sub === "string" ? claims.sub : null;

  if (!userId || !claims) {
    return {
      authenticated: false as const,
      claims: null,
      supabase,
      userId: null,
    };
  }

  return {
    authenticated: true as const,
    claims,
    supabase,
    userId,
  };
});

export async function requireUser(localeOverride?: AppLocale) {
  const auth = await getAuthContext();

  if (auth.authenticated) {
    return auth;
  }

  const locale = localeOverride ?? (await getLocale());
  return redirect({ href: "/login", locale });
}
