import { type NextRequest, NextResponse } from "next/server";

import { logServerError } from "@/lib/log-server-error";
import { updateSession } from "@/lib/supabase/proxy";

export async function proxy(request: NextRequest) {
  try {
    return await updateSession(request);
  } catch (error) {
    logServerError("proxy.session_refresh_failed", error, {
      request: {
        method: request.method,
        pathname: request.nextUrl.pathname,
      },
    });

    const unavailableUrl = request.nextUrl.clone();
    unavailableUrl.pathname = "/service-unavailable";
    unavailableUrl.search = "";

    return NextResponse.rewrite(unavailableUrl);
  }
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|service-unavailable|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
