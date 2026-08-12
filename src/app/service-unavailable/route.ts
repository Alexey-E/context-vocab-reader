import { APP_THEME_COOKIE, parseAppTheme } from "@/features/theme/theme";

function getTheme(request: Request) {
  const cookie = request.headers
    .get("cookie")
    ?.split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${APP_THEME_COOKIE.name}=`));

  return parseAppTheme(cookie?.slice(APP_THEME_COOKIE.name.length + 1));
}

function createServiceUnavailablePage(theme: string) {
  return `<!doctype html>
<html lang="en" data-theme="${theme}">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="robots" content="noindex, nofollow" />
    <title>Service unavailable | Context Vocab Reader</title>
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
        <p class="eyebrow">Temporary interruption</p>
        <h1>The service is currently unavailable</h1>
        <p class="description">Authentication and saved reading data cannot be reached right now. Please try again in a few minutes.</p>
        <form action="/" method="get"><button type="submit">Try again</button></form>
      </section>
    </main>
  </body>
</html>`;
}

export function GET(request: Request) {
  return new Response(createServiceUnavailablePage(getTheme(request)), {
    status: 503,
    headers: {
      "Cache-Control": "no-store",
      "Content-Type": "text/html; charset=utf-8",
      "Retry-After": "60",
    },
  });
}
