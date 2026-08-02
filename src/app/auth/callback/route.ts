import { type NextRequest, NextResponse } from "next/server";

import { createAppUrl } from "@/lib/app-url";
import { createErrorPayload } from "@/lib/errors/catalog";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return NextResponse.redirect(createAppUrl("/account"));
    }
  }

  const loginUrl = createAppUrl("/login");
  const payload = createErrorPayload("auth.oauth_callback_failed");
  loginUrl.searchParams.set("error", payload.code);

  return NextResponse.redirect(loginUrl);
}
