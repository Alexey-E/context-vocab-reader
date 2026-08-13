import { expect, test } from "@playwright/test";

const LOCALIZED_LOGIN_HEADINGS = [
  ["en", "/login", "Welcome back", "ltr"],
  ["ru", "/ru/login", "С возвращением", "ltr"],
  ["fr", "/fr/login", "Bon retour", "ltr"],
  ["es", "/es/login", "Te damos la bienvenida de nuevo", "ltr"],
  ["ar", "/ar/login", "مرحبًا بعودتك", "rtl"],
] as const;

for (const [locale, pathname, heading, direction] of LOCALIZED_LOGIN_HEADINGS) {
  test(`renders the ${locale} interface at its canonical URL`, async ({
    page,
  }) => {
    await page.goto(pathname);

    await expect(page).toHaveURL(
      new RegExp(`${pathname.replace("/", "\\/")}$`),
    );
    await expect(page.locator("html")).toHaveAttribute("lang", locale);
    await expect(page.locator("html")).toHaveAttribute("dir", direction);
    await expect(page.getByRole("heading", { name: heading })).toBeVisible();
  });
}

test("canonicalizes the unnecessary English prefix", async ({ page }) => {
  await page.goto("/en/login");

  await expect(page).toHaveURL(/\/login$/);
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
});

test("detects the browser language on a first visit", async ({
  baseURL,
  browser,
}) => {
  const context = await browser.newContext({ baseURL, locale: "fr-FR" });
  const page = await context.newPage();

  await page.goto("/");

  await expect(page).toHaveURL(/\/fr$/);
  await expect(page.locator("html")).toHaveAttribute("lang", "fr");

  await context.close();
});

test("gives an explicit locale URL priority over a saved preference", async ({
  baseURL,
  page,
}) => {
  await page.context().addCookies([
    {
      name: "NEXT_LOCALE",
      value: "ru",
      url: baseURL,
    },
  ]);

  await page.goto("/es/login");

  await expect(page).toHaveURL(/\/es\/login$/);
  await expect(page.locator("html")).toHaveAttribute("lang", "es");
});

test("switches locale while preserving path, query, hash, and preference", async ({
  page,
}) => {
  await page.goto("/login?mode=sign-up#auth-form");

  await page.getByRole("button", { name: "Language: English" }).click();
  await page.getByRole("menuitemradio", { name: /^Français/ }).click();

  await expect(page).toHaveURL(/\/fr\/login\?mode=sign-up#auth-form$/);
  await expect(page.locator("html")).toHaveAttribute("lang", "fr");
  await expect
    .poll(async () => {
      const cookie = (await page.context().cookies()).find(
        ({ name }) => name === "NEXT_LOCALE",
      );
      return cookie?.value;
    })
    .toBe("fr");

  await page.goto("/");
  await expect(page).toHaveURL(/\/fr$/);
});

test("preserves an auth mode selected in the UI across locale changes", async ({
  page,
}) => {
  await page.goto("/login");

  await page.getByRole("tab", { name: "Create account" }).click();
  await expect(page).toHaveURL(/\/login\?mode=sign-up$/);

  await page.getByRole("button", { name: "Language: English" }).click();
  await page.getByRole("menuitemradio", { name: /^Français/ }).click();

  await expect(page).toHaveURL(/\/fr\/login\?mode=sign-up$/);
  await expect(
    page.getByRole("tab", { name: "Créer un compte" }),
  ).toHaveAttribute("aria-selected", "true");
});

test("supports keyboard navigation in the language menu", async ({ page }) => {
  await page.goto("/");

  const trigger = page.getByRole("button", { name: "Language: English" });
  await trigger.focus();
  await page.keyboard.press("Enter");

  const english = page.getByRole("menuitemradio", { name: "English" });
  const russian = page.getByRole("menuitemradio", { name: "Русский" });
  const arabic = page.getByRole("menuitemradio", { name: "العربية" });
  const menu = page.getByRole("menu");

  await expect(english).toBeFocused();
  await page.keyboard.press("ArrowDown");
  await expect(russian).toBeFocused();
  await russian.press("End");
  await expect(arabic).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(menu).toBeHidden();
  await expect(trigger).toBeFocused();

  await page.keyboard.press("Enter");
  await expect(menu).toBeVisible();
  await english.press("End");
  await expect(arabic).toBeFocused();
  await arabic.press("Space");
  await expect(page).toHaveURL(/\/ar$/);
});

test("keeps localized mobile headers inside the viewport", async ({ page }) => {
  await page.goto("/ar/login");

  const viewport = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));

  expect(viewport.scrollWidth).toBeLessThanOrEqual(viewport.clientWidth);
});

test("keeps the locale when redirecting away from a protected route", async ({
  page,
}) => {
  await page.goto("/ar/account");

  await expect(page).toHaveURL(/\/ar\/login$/);
});

test("localizes known callback errors", async ({ page }) => {
  await page.goto("/ru/login?error=auth.oauth_callback_failed");

  await expect(
    page.locator('[role="alert"]:not(#__next-route-announcer__)'),
  ).toContainText("Не удалось завершить вход через Google.");
});
