const serviceUnavailablePage = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="robots" content="noindex, nofollow" />
    <title>Service unavailable | Context Vocab Reader</title>
    <style>
      * { box-sizing: border-box; }
      body { margin: 0; background: #f8fafc; color: #0f172a; font-family: system-ui, sans-serif; }
      main { min-height: 100vh; display: grid; place-items: center; padding: 4rem 1.5rem; }
      section { width: 100%; max-width: 32rem; padding: 2.5rem; border: 1px solid #e2e8f0; border-radius: 1.5rem; background: white; box-shadow: 0 1px 2px rgb(15 23 42 / 0.05); }
      .eyebrow { margin: 0; color: #d97706; font-size: 0.875rem; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; }
      h1 { margin: 1rem 0 0; font-size: clamp(1.875rem, 6vw, 2.25rem); line-height: 1.15; }
      .description { margin: 1rem 0 0; color: #475569; line-height: 1.75; }
      form { margin-top: 2rem; }
      button { width: 100%; min-height: 3rem; border: 0; border-radius: 0.75rem; background: #0f172a; color: white; cursor: pointer; font: inherit; font-weight: 700; }
      button:hover { background: #334155; }
      button:focus-visible { outline: 2px solid #0f172a; outline-offset: 2px; }
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

export function GET() {
  return new Response(serviceUnavailablePage, {
    status: 503,
    headers: {
      "Cache-Control": "no-store",
      "Content-Type": "text/html; charset=utf-8",
      "Retry-After": "60",
    },
  });
}
