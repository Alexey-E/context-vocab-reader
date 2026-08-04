import "server-only";

import { redirect } from "next/navigation";
import { cache } from "react";

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

export async function requireUser() {
  const auth = await getAuthContext();

  if (!auth.authenticated) {
    redirect("/login");
  }

  return auth;
}
