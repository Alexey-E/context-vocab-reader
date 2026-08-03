import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { getAppUrl } from "@/lib/app-url";

describe("getAppUrl", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("requires an explicit application URL in production", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "");
    vi.stubEnv("VERCEL_ENV", "");
    vi.stubEnv("VERCEL_URL", "");

    expect(() => getAppUrl()).toThrowError(
      "Missing NEXT_PUBLIC_APP_URL. Set it to the public application origin in production.",
    );
  });

  it("keeps the loopback fallback for local development", () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "");
    vi.stubEnv("VERCEL_ENV", "");
    vi.stubEnv("VERCEL_URL", "");

    expect(getAppUrl()).toBe("http://127.0.0.1:3000");
  });

  it("uses the deployment URL for Vercel previews", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "");
    vi.stubEnv("VERCEL_ENV", "preview");
    vi.stubEnv("VERCEL_URL", "context-vocab-reader-preview.vercel.app");

    expect(getAppUrl()).toBe("https://context-vocab-reader-preview.vercel.app");
  });
});
