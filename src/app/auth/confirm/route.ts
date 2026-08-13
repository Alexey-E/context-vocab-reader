import { type NextRequest, NextResponse } from "next/server";

import { getPathname } from "@/i18n/navigation";
import { parseAppLocale } from "@/i18n/routing";
import { createAppUrl } from "@/lib/app-url";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const locale = parseAppLocale(request.nextUrl.searchParams.get("locale"));

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return NextResponse.redirect(
        createAppUrl(getPathname({ href: "/account", locale })),
      );
    }
  }

  const loginUrl = createAppUrl(getPathname({ href: "/login", locale }));
  loginUrl.searchParams.set("error", "auth.confirmation_failed");

  return NextResponse.redirect(loginUrl);
}
