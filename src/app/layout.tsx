import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";
import { cookies } from "next/headers";

import { ThemeProvider } from "@/features/theme/theme-provider";
import { APP_THEME_COOKIE, parseAppTheme } from "@/features/theme/theme";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Context Vocab Reader",
    template: "%s | Context Vocab Reader",
  },
  description:
    "Read foreign-language texts, translate sentences in context, and save useful words to your personal vocabulary.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const theme = parseAppTheme(cookieStore.get(APP_THEME_COOKIE.name)?.value);

  return (
    <html
      lang="en"
      data-theme={theme}
      className={`${GeistSans.variable} ${GeistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col font-sans">
        <ThemeProvider initialTheme={theme}>
          {children}
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  );
}
