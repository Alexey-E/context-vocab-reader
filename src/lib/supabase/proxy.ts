import { createServerClient, type CookieOptions } from "@supabase/ssr";
import type { NextRequest } from "next/server";

import { getSupabaseConfig } from "@/lib/supabase/config";
import type { Database } from "@/lib/supabase/database.types";

export type SessionUpdate = Readonly<{
  cookies: ReadonlyArray<
    Readonly<{
      name: string;
      options: CookieOptions;
      value: string;
    }>
  >;
  headers: Readonly<Record<string, string>>;
}>;

export async function updateSession(
  request: NextRequest,
): Promise<SessionUpdate> {
  const cookies: Array<SessionUpdate["cookies"][number]> = [];
  const responseHeaders: Record<string, string> = {};
  const { publishableKey, url } = getSupabaseConfig();

  const supabase = createServerClient<Database>(url, publishableKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });

        cookies.push(...cookiesToSet);
        Object.assign(responseHeaders, headers);
      },
    },
  });

  // Keep this directly after client creation so a refresh can still set cookies.
  await supabase.auth.getClaims();

  return { cookies, headers: responseHeaders } satisfies SessionUpdate;
}
