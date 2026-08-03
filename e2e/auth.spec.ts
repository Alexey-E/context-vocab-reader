import { expect, test } from "@playwright/test";

test("renders the authentication entry points", async ({ page }) => {
  await page.goto("/login");

  await expect(
    page.getByRole("heading", { name: "Welcome back" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Continue with Google" }),
  ).toBeVisible();
  await expect(page.getByLabel("Email address")).toBeVisible();
  await expect(page.getByLabel("Password", { exact: true })).toBeVisible();
});

test("keeps the login page inside the viewport", async ({ page }) => {
  await page.goto("/login");

  const viewport = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));

  expect(viewport.scrollWidth).toBeLessThanOrEqual(viewport.clientWidth);
});

test("shows a known callback error", async ({ page }) => {
  await page.goto("/login?error=auth.oauth_callback_failed");

  await expect(
    page.locator('[role="alert"]:not(#__next-route-announcer__)'),
  ).toContainText("Google sign-in could not be completed.");
});

test("ignores an unknown callback error", async ({ page }) => {
  await page.goto("/login?error=provider.internal_detail");

  await expect(
    page.locator('[role="alert"]:not(#__next-route-announcer__)'),
  ).toHaveCount(0);
  await expect(page.getByText("provider.internal_detail")).toHaveCount(0);
});

test("shows structured field validation errors", async ({ page }) => {
  await page.goto("/login?mode=sign-up");
  await page.locator("form").evaluate((form) => {
    (form as HTMLFormElement).noValidate = true;
  });
  await page.getByLabel("Email address").fill("not-an-email");
  await page.getByLabel("Password", { exact: true }).fill("123");
  await page
    .getByRole("button", { name: "Create account", exact: true })
    .click();

  await expect(
    page
      .getByRole("alert")
      .filter({ hasText: "Check the highlighted fields." }),
  ).toBeVisible();
  await expect(page.getByText("Enter a valid email address.")).toBeVisible();
  await expect(
    page.getByText("Password must contain at least 6 characters."),
  ).toBeVisible();
});

test("redirects a signed-out visitor away from a protected route", async ({
  page,
}) => {
  await page.goto("/account");

  await expect(page).toHaveURL(/\/login(?:\?.*)?$/);
});
