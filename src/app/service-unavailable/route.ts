import { createTranslator } from "next-intl";

import { APP_THEME_COOKIE, parseAppTheme } from "@/features/theme/theme";
import { loadMessages } from "@/i18n/messages";
import { getPathname } from "@/i18n/navigation";
import { getLocaleDirection, parseAppLocale } from "@/i18n/routing";

function getTheme(request: Request) {
  const cookie = request.headers
    .get("cookie")
    ?.split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${APP_THEME_COOKIE.name}=`));

  return parseAppTheme(cookie?.slice(APP_THEME_COOKIE.name.length + 1));
}

type ServiceUnavailableCopy = Readonly<{
  description: string;
  eyebrow: string;
  retry: string;
  title: string;
}>;

function createServiceUnavailablePage(
  theme: string,
  locale: ReturnType<typeof parseAppLocale>,
  retryPath: string,
  copy: ServiceUnavailableCopy,
) {
  return `<!doctype html>
<html lang="${locale}" dir="${getLocaleDirection(locale)}" data-theme="${theme}">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="robots" content="noindex, nofollow" />
    <title>${copy.title} | Context Vocab Reader</title>
    <style>
      :root, html[data-theme="light"] { --page: #f8fafc; --surface: #fff; --text: #0f172a; --muted: #475569; --border: #e2e8f0; --primary: #2563eb; --primary-hover: #1d4ed8; --primary-text: #fff; color-scheme: light; }
      html[data-theme="dark"] { --page: #020617; --surface: #0f172a; --text: #f8fafc; --muted: #cbd5e1; --border: #334155; --primary: #60a5fa; --primary-hover: #93c5fd; --primary-text: #0f172a; color-scheme: dark; }
      @media (prefers-color-scheme: dark) { html[data-theme="system"] { --page: #020617; --surface: #0f172a; --text: #f8fafc; --muted: #cbd5e1; --border: #334155; --primary: #60a5fa; --primary-hover: #93c5fd; --primary-text: #0f172a; color-scheme: dark; } }
      * { box-sizing: border-box; }
      body { margin: 0; background: var(--page); color: var(--text); font-family: system-ui, sans-serif; }
      main { min-height: 100vh; display: grid; place-items: center; padding: 4rem 1.5rem; }
      section { width: 100%; max-width: 32rem; padding: 2.5rem; border: 1px solid var(--border); border-radius: 1.5rem; background: var(--surface); box-shadow: 0 1px 2px rgb(15 23 42 / 0.05); }
      .eyebrow { margin: 0; color: var(--primary); font-size: 0.875rem; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; }
      h1 { margin: 1rem 0 0; font-size: clamp(1.875rem, 6vw, 2.25rem); line-height: 1.15; }
      .description { margin: 1rem 0 0; color: var(--muted); line-height: 1.75; }
      form { margin-top: 2rem; }
      button { width: 100%; min-height: 3rem; border: 0; border-radius: 0.75rem; background: var(--primary); color: var(--primary-text); cursor: pointer; font: inherit; font-weight: 700; }
      button:hover { background: var(--primary-hover); }
      button:focus-visible { outline: 2px solid var(--primary); outline-offset: 2px; }
    </style>
  </head>
  <body>
    <main>
      <section>
        <p class="eyebrow">${copy.eyebrow}</p>
        <h1>${copy.title}</h1>
        <p class="description">${copy.description}</p>
        <form action="${retryPath}" method="get"><button type="submit">${copy.retry}</button></form>
      </section>
    </main>
  </body>
</html>`;
}

export async function GET(request: Request) {
  const locale = parseAppLocale(
    new URL(request.url).searchParams.get("locale"),
  );
  const messages = await loadMessages(locale);
  const t = createTranslator({ locale, messages });
  const retryPath = getPathname({ href: "/", locale });

  return new Response(
    createServiceUnavailablePage(getTheme(request), locale, retryPath, {
      description: t("RouteStates.serviceUnavailable.description"),
      eyebrow: t("RouteStates.serviceUnavailable.eyebrow"),
      retry: t("Common.tryAgain"),
      title: t("RouteStates.serviceUnavailable.title"),
    }),
    {
      status: 503,
      headers: {
        "Cache-Control": "no-store",
        "Content-Type": "text/html; charset=utf-8",
        "Retry-After": "60",
      },
    },
  );
}
