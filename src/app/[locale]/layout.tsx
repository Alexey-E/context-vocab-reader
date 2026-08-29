import { Analytics } from "@vercel/analytics/next";
import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations } from "next-intl/server";

import { ThemeProvider } from "@/features/theme/theme-provider";
import { APP_THEME_COOKIE, parseAppTheme } from "@/features/theme/theme";
import { ReactAriaProvider } from "@/i18n/react-aria-provider";
import { getLocaleDirection, routing } from "@/i18n/routing";
import "../globals.css";

type LocaleLayoutProps = Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>;

export async function generateMetadata({
  params,
}: Pick<LocaleLayoutProps, "params">): Promise<Metadata> {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    return {};
  }

  const t = await getTranslations({ locale, namespace: "Metadata" });

  return {
    description: t("defaultDescription"),
    title: {
      default: t("defaultTitle"),
      template: `%s | ${t("defaultTitle")}`,
    },
  };
}

export default async function RootLayout({
  children,
  params,
}: LocaleLayoutProps) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  const cookieStore = await cookies();
  const theme = parseAppTheme(cookieStore.get(APP_THEME_COOKIE.name)?.value);
  const messages = await getMessages();

  return (
    <html
      lang={locale}
      dir={getLocaleDirection(locale)}
      data-theme={theme}
      className={`${GeistSans.variable} ${GeistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col font-sans">
        <NextIntlClientProvider messages={messages}>
          <ReactAriaProvider locale={locale}>
            <ThemeProvider initialTheme={theme}>
              {children}
              <Analytics />
            </ThemeProvider>
          </ReactAriaProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
