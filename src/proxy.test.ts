import { unstable_doesMiddlewareMatch } from "next/experimental/testing/server";
import { describe, expect, it } from "vitest";

import { config } from "@/proxy";

function doesProxyMatch(url: string) {
  return unstable_doesMiddlewareMatch({ config, url });
}

describe("proxy matcher", () => {
  it("keeps dotted dynamic routes in locale routing", () => {
    expect(doesProxyMatch("/samples/foo.bar")).toBe(true);
    expect(doesProxyMatch("/ar/samples/foo.bar")).toBe(true);
  });

  it.each([
    "/auth/callback",
    "/_next/static/chunks/app.js",
    "/_vercel/insights",
    "/favicon.ico",
    "/service-unavailable",
  ])("excludes %s", (url) => {
    expect(doesProxyMatch(url)).toBe(false);
  });
});
