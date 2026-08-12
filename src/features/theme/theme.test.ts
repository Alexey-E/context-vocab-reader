import { describe, expect, it } from "vitest";

import {
  APP_THEME_COOKIE,
  getAppThemeCookieOptions,
  parseAppTheme,
} from "@/features/theme/theme";

describe("parseAppTheme", () => {
  it.each(["system", "light", "dark"] as const)(
    "accepts the %s theme",
    (theme) => {
      expect(parseAppTheme(theme)).toBe(theme);
    },
  );

  it("falls back to the system theme", () => {
    expect(parseAppTheme("sepia")).toBe("system");
    expect(parseAppTheme(undefined)).toBe("system");
  });
});

describe("getAppThemeCookieOptions", () => {
  it("returns persistent production cookie options", () => {
    expect(getAppThemeCookieOptions(true)).toEqual({
      httpOnly: true,
      maxAge: APP_THEME_COOKIE.maxAgeSeconds,
      path: "/",
      sameSite: "lax",
      secure: true,
    });
  });

  it("allows HTTP during local development", () => {
    expect(getAppThemeCookieOptions(false).secure).toBe(false);
  });
});
