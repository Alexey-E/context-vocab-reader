import { expect, test, type Page } from "@playwright/test";

test.describe.configure({ mode: "serial" });

async function expectThemeCookie(page: Page, value: string) {
  await expect
    .poll(async () => {
      const cookie = (await page.context().cookies()).find(
        ({ name }) => name === "app-theme",
      );
      return cookie?.value;
    })
    .toBe(value);
}

async function expectVisibleFocusIndicator(
  element: ReturnType<Page["getByRole"]>,
) {
  await expect(element).toHaveAttribute("data-focus-visible", "true");
  await expect
    .poll(() =>
      element.evaluate((node) => {
        const style = getComputedStyle(node);
        return {
          style: style.outlineStyle,
          width: style.outlineWidth,
        };
      }),
    )
    .toEqual({ style: "solid", width: "2px" });
}

async function tabToElement(
  page: Page,
  element: ReturnType<Page["getByRole"]>,
) {
  for (let attempt = 0; attempt < 10; attempt += 1) {
    await page.keyboard.press("Tab");
    if (await element.evaluate((node) => node === document.activeElement)) {
      return;
    }
  }

  throw new Error("Could not reach the element with keyboard navigation.");
}

test("persists the selected theme across navigation and refresh", async ({
  page,
}) => {
  await page.goto("/");

  await page.getByRole("button", { name: "Theme: System" }).click();
  await page.getByRole("menuitemradio", { name: "Dark", exact: true }).click();

  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await expectThemeCookie(page, "dark");

  await page.goto("/login");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");

  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
});

test("uses the emulated system color scheme", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "dark" });
  await page.goto("/");

  await expect(page.locator("html")).toHaveAttribute("data-theme", "system");
  await expect
    .poll(() =>
      page
        .locator("html")
        .evaluate((element) =>
          getComputedStyle(element).getPropertyValue("color-scheme"),
        ),
    )
    .toBe("dark");
});

test("navigates the theme menu with arrows and selects with Enter", async ({
  page,
}) => {
  await page.goto("/");

  const trigger = page.getByRole("button", { name: "Theme: System" });
  await tabToElement(page, trigger);
  await expect(trigger).toBeFocused();
  await expectVisibleFocusIndicator(trigger);
  await page.keyboard.press("Enter");

  const menu = page.getByRole("menu");
  const system = page.getByRole("menuitemradio", { name: "System" });
  const light = page.getByRole("menuitemradio", { name: "Light" });
  const dark = page.getByRole("menuitemradio", { name: "Dark" });

  await expect(menu).toBeVisible();
  await expect(system).toBeFocused();
  await expectVisibleFocusIndicator(system);

  await page.keyboard.press("ArrowDown");
  await expect(light).toBeFocused();
  await expectVisibleFocusIndicator(light);
  await page.keyboard.press("ArrowDown");
  await expect(dark).toBeFocused();
  await page.keyboard.press("ArrowDown");
  await expect(system).toBeFocused();
  await page.keyboard.press("ArrowUp");
  await expect(dark).toBeFocused();
  await page.keyboard.press("Home");
  await expect(system).toBeFocused();
  await page.keyboard.press("End");
  await expect(dark).toBeFocused();
  await dark.press("Enter");

  await expect(menu).toBeHidden();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await expectThemeCookie(page, "dark");
  await expect(page.getByRole("button", { name: "Theme: Dark" })).toBeFocused();
});

test("supports trigger arrows, Space, Escape, and modal focus containment", async ({
  page,
}) => {
  await page.goto("/");

  const systemTrigger = page.getByRole("button", { name: "Theme: System" });
  await systemTrigger.focus();
  await page.keyboard.press("ArrowDown");

  const menu = page.getByRole("menu");
  const system = page.getByRole("menuitemradio", { name: "System" });
  const dark = page.getByRole("menuitemradio", { name: "Dark" });

  await expect(menu).toBeVisible();
  await expect(system).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(menu).toBeHidden();
  await expect(systemTrigger).toBeFocused();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "system");

  await page.keyboard.press("Enter");
  await expect(system).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(menu).toBeVisible();
  await expect
    .poll(() =>
      menu.evaluate((element) =>
        element.parentElement?.contains(document.activeElement),
      ),
    )
    .toBe(true);
  await page.keyboard.press("Escape");
  await expect(menu).toBeHidden();
  await expect(systemTrigger).toBeFocused();

  await page.keyboard.press("ArrowUp");
  await expect(system).toBeFocused();
  await page.keyboard.press("End");
  await expect(dark).toBeFocused();
  await page.keyboard.press("Space");
  await expect(menu).toBeHidden();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await expectThemeCookie(page, "dark");
  await expect(page.getByRole("button", { name: "Theme: Dark" })).toBeFocused();
});

test("does not introduce horizontal overflow", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Theme: System" }).click();

  const viewport = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));

  expect(viewport.scrollWidth).toBeLessThanOrEqual(viewport.clientWidth);
});
