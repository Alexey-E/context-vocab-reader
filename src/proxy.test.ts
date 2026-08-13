import { unstable_doesMiddlewareMatch } from "next/experimental/testing/server";
import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/supabase/proxy", () => ({
  updateSession: vi.fn(),
}));

import { config, proxy } from "@/proxy";
import { updateSession } from "@/lib/supabase/proxy";

const updateSessionMock = vi.mocked(updateSession);

const emptySessionUpdate = {
  cookies: [],
  headers: {},
} as const;

function mockSessionRefresh() {
  updateSessionMock.mockImplementation(async (request) => {
    request.cookies.set("sb-session", "refreshed-token");

    return {
      cookies: [
        {
          name: "sb-session",
          options: { httpOnly: true, path: "/", sameSite: "lax" },
          value: "refreshed-token",
        },
      ],
      headers: {
        "cache-control":
          "private, no-cache, no-store, must-revalidate, max-age=0",
        expires: "0",
        pragma: "no-cache",
      },
    };
  });
}

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

describe("proxy session and locale composition", () => {
  beforeEach(() => {
    updateSessionMock.mockReset();
    updateSessionMock.mockResolvedValue(emptySessionUpdate);
  });

  it.each([
    ["rewrite", "/account", "/en/account"],
    ["next", "/ar/account", null],
  ])(
    "preserves a refreshed session during an i18n %s response",
    async (_variant, pathname, expectedRewritePathname) => {
      mockSessionRefresh();

      const response = await proxy(
        new NextRequest(`http://127.0.0.1:3000${pathname}`),
      );

      const rewrite = response.headers.get("x-middleware-rewrite");

      expect(rewrite ? new URL(rewrite).pathname : null).toBe(
        expectedRewritePathname,
      );
      expect(response.headers.get("x-middleware-request-cookie")).toContain(
        "sb-session=refreshed-token",
      );
      expect(
        response.headers.get("x-middleware-request-x-next-intl-locale"),
      ).toBe(pathname.startsWith("/ar") ? "ar" : "en");
      expect(response.cookies.get("sb-session")?.value).toBe("refreshed-token");
      expect(response.headers.get("cache-control")).toBe(
        "private, no-cache, no-store, must-revalidate, max-age=0",
      );
      expect(response.headers.get("expires")).toBe("0");
      expect(response.headers.get("pragma")).toBe("no-cache");
    },
  );

  it("applies refresh cookies and headers to locale redirects", async () => {
    mockSessionRefresh();

    const response = await proxy(
      new NextRequest("http://127.0.0.1:3000/en/account"),
    );

    expect(response.status).toBe(307);
    expect(new URL(response.headers.get("location")!).pathname).toBe(
      "/account",
    );
    expect(response.cookies.get("sb-session")?.value).toBe("refreshed-token");
    expect(response.headers.get("cache-control")).toContain("no-store");
  });

  it("does not add auth cookies or cache headers without a refresh", async () => {
    const response = await proxy(
      new NextRequest("http://127.0.0.1:3000/account"),
    );

    expect(
      response.headers.get("x-middleware-request-x-next-intl-locale"),
    ).toBe("en");
    expect(response.cookies.get("sb-session")).toBeUndefined();
    expect(response.headers.get("cache-control")).toBeNull();
    expect(response.headers.get("expires")).toBeNull();
    expect(response.headers.get("pragma")).toBeNull();
  });
});
