import { type NextRequest, NextResponse } from "next/server";
import { hasLocale } from "next-intl";
import createMiddleware from "next-intl/middleware";

import { routing } from "@/i18n/routing";
import { logServerError } from "@/lib/log-server-error";
import { updateSession } from "@/lib/supabase/proxy";

const handleI18nRouting = createMiddleware(routing);

function copyCookies(source: NextResponse, target: NextResponse) {
  source.cookies.getAll().forEach((cookie) => target.cookies.set(cookie));
}

function getNegotiatedLocale(request: NextRequest, response: NextResponse) {
  const routedUrl =
    response.headers.get("location") ??
    response.headers.get("x-middleware-rewrite") ??
    request.url;
  const [pathnameLocale] = new URL(routedUrl, request.url).pathname
    .split("/")
    .filter(Boolean);

  return hasLocale(routing.locales, pathnameLocale)
    ? pathnameLocale
    : routing.defaultLocale;
}

export async function proxy(request: NextRequest) {
  try {
    const authResponse = await updateSession(request);
    const response = handleI18nRouting(request);

    copyCookies(authResponse, response);

    return response;
  } catch (error) {
    logServerError("proxy.session_refresh_failed", error, {
      request: {
        method: request.method,
        pathname: request.nextUrl.pathname,
      },
    });

    const i18nResponse = handleI18nRouting(request);
    const unavailableUrl = request.nextUrl.clone();
    unavailableUrl.pathname = "/service-unavailable";
    unavailableUrl.search = "";
    unavailableUrl.searchParams.set(
      "locale",
      getNegotiatedLocale(request, i18nResponse),
    );

    const response = NextResponse.rewrite(unavailableUrl);
    copyCookies(i18nResponse, response);

    return response;
  }
}

export const config = {
  matcher: ["/((?!auth|_next|_vercel|favicon.ico|service-unavailable).*)"],
};
