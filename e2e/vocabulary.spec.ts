import { expect, test } from "@playwright/test";

test("saves and manages a vocabulary card", async ({ page }, testInfo) => {
  test.slow();

  const account = `vocabulary-${testInfo.project.name}-${Date.now()}@example.test`;

  await page.goto("/login?mode=sign-up");
  await page.getByLabel("Email address").fill(account);
  await page.getByLabel("Password", { exact: true }).fill("Vocab-e2e-2026!");
  await page
    .getByRole("button", { name: "Create account", exact: true })
    .click();

  await expect(page).toHaveURL(/\/account$/);

  await page.goto("/samples/service-overview-en");
  await page
    .getByRole("button", { name: "Translate and save Context", exact: true })
    .click();
  await page.getByRole("button", { name: "Save word", exact: true }).click();

  const saveDialog = page.getByRole("dialog", { name: "Save “Context”" });
  await expect(saveDialog.getByLabel("Meanings")).toHaveValue(
    "[mock en→es] Context",
  );
  await saveDialog.getByLabel("Note (optional)").fill("Dashboard E2E");
  await saveDialog.getByRole("button", { name: "Save card" }).click();
  await expect(page.getByText("Vocabulary card saved")).toBeVisible();
  await page.getByRole("button", { name: "Close", exact: true }).click();

  await page.goto("/vocabulary");
  await expect(
    page.getByRole("heading", { name: "My vocabulary" }),
  ).toBeVisible();

  const card = page.locator("article").filter({ hasText: "Context" });
  await expect(card).toContainText("Dashboard E2E");

  await page.getByLabel("Search cards").fill("Dashboard E2E");
  await page.getByRole("button", { name: "Apply" }).click();
  await expect(page).toHaveURL(/\/vocabulary\?q=Dashboard\+E2E&pair=$/);
  await expect(page.getByText("1 card")).toBeVisible();
  await page.waitForLoadState("networkidle");

  await card.getByRole("button", { name: "Edit" }).click();
  const editDialog = page.getByRole("dialog", { name: "Edit “context”" });
  await editDialog
    .getByLabel("Meanings")
    .fill("[mock en→es] Context, contexto");
  await editDialog.getByRole("button", { name: "Save changes" }).click();
  await expect(
    editDialog.getByText("The vocabulary card was updated."),
  ).toBeVisible();
  await editDialog.getByRole("button", { name: "Close" }).click();
  await expect(card).toContainText("contexto");

  await card.getByRole("button", { name: "Delete context" }).click();
  const deleteDialog = page.getByRole("dialog", {
    name: "Delete this card?",
  });
  await deleteDialog
    .getByRole("button", { name: "Delete permanently" })
    .click();

  await expect(
    page.getByRole("heading", { name: "No saved words yet" }),
  ).toBeVisible();
});
