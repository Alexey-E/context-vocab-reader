export const APP_THEMES = ["system", "light", "dark"] as const;

export type AppTheme = (typeof APP_THEMES)[number];

export const APP_THEME_COOKIE = {
  maxAgeSeconds: 60 * 60 * 24 * 365,
  name: "app-theme",
} as const;

const DEFAULT_APP_THEME: AppTheme = "system";

export function parseAppTheme(value: unknown): AppTheme {
  return APP_THEMES.includes(value as AppTheme)
    ? (value as AppTheme)
    : DEFAULT_APP_THEME;
}

export function getAppThemeCookieOptions(secure: boolean) {
  return {
    httpOnly: true,
    maxAge: APP_THEME_COOKIE.maxAgeSeconds,
    path: "/",
    sameSite: "lax" as const,
    secure,
  };
}
