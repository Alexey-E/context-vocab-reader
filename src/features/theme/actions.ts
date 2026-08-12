"use server";

import { cookies } from "next/headers";

import {
  APP_THEME_COOKIE,
  getAppThemeCookieOptions,
  parseAppTheme,
  type AppTheme,
} from "@/features/theme/theme";

export async function setAppTheme(theme: AppTheme) {
  const cookieStore = await cookies();

  cookieStore.set(
    APP_THEME_COOKIE.name,
    parseAppTheme(theme),
    getAppThemeCookieOptions(process.env.NODE_ENV === "production"),
  );
}
