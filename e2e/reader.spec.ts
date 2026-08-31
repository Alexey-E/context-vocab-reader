import { expect, test } from "@playwright/test";

test("translates a word from the keyboard and exposes the save flow", async ({
  page,
}) => {
  await page.goto("/samples/service-overview-en");

  const word = page.getByRole("button", {
    exact: true,
    name: "Translate and save Context",
  });
  await word.focus();
  await expect(word).toBeFocused();
  await page.keyboard.press("Enter");

  await expect(page.getByText("[mock en→es] Context")).toBeVisible({
    timeout: 15_000,
  });
  await expect(
    page.getByRole("button", { exact: true, name: "Save word" }),
  ).toBeVisible();
});
