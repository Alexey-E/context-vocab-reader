import { expect, test, type Page } from "@playwright/test";

async function selectSentence(page: Page, index: number) {
  await page
    .locator("[data-reader-source-segment]")
    .nth(index)
    .evaluate((element) => {
      const range = document.createRange();
      range.selectNodeContents(element);

      const selection = window.getSelection();
      selection?.removeAllRanges();
      selection?.addRange(range);
      element.dispatchEvent(new PointerEvent("pointerup", { bubbles: true }));
    });
}

test("ignores stale selection translation responses", async ({ page }) => {
  const completedRequests: string[] = [];
  const requestedTexts: string[] = [];

  await page.route("**/api/translation", async (route) => {
    const body = route.request().postDataJSON() as { text: string };
    const isFirstRequest = requestedTexts.length === 0;
    requestedTexts.push(body.text);

    await new Promise((resolve) =>
      setTimeout(resolve, isFirstRequest ? 300 : 10),
    );
    completedRequests.push(body.text);

    await route.fulfill({
      json: {
        provider: "mock",
        status: "success",
        translatedText: isFirstRequest
          ? "stale first translation"
          : "current second translation",
      },
    });
  });

  await page.goto("/samples/service-overview-en");

  await selectSentence(page, 0);
  await page.getByRole("button", { name: "Translate selection" }).click();
  await expect.poll(() => requestedTexts).toHaveLength(1);

  await selectSentence(page, 1);
  await page.getByRole("button", { name: "Translate selection" }).click();

  await expect(page.getByText("current second translation")).toBeVisible();
  await expect.poll(() => completedRequests).toHaveLength(2);
  await expect(page.getByText("current second translation")).toBeVisible();
  await expect(page.getByText("stale first translation")).toHaveCount(0);
});
