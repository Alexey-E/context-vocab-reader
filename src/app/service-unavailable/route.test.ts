import { describe, expect, it } from "vitest";

import { GET } from "./route";

describe("service unavailable response", () => {
  it("returns a non-cacheable 503 page that clients may retry", async () => {
    const response = await GET(
      new Request("http://127.0.0.1/service-unavailable"),
    );

    expect(response.status).toBe(503);
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(response.headers.get("retry-after")).toBe("60");
    expect(await response.text()).toContain(
      "The service is currently unavailable",
    );
  });

  it("uses a valid persisted application theme", async () => {
    const response = await GET(
      new Request("http://127.0.0.1/service-unavailable", {
        headers: { cookie: "app-theme=dark" },
      }),
    );

    expect(await response.text()).toContain('data-theme="dark"');
  });

  it.each([
    ["en", "ltr", "The service is currently unavailable"],
    ["ru", "ltr", "Сервис временно недоступен"],
    ["fr", "ltr", "Le service est momentanément indisponible"],
    ["es", "ltr", "El servicio no está disponible temporalmente"],
    ["ar", "rtl", "الخدمة غير متاحة حاليًا"],
  ])("localizes the page for %s", async (locale, direction, heading) => {
    const response = await GET(
      new Request(`http://127.0.0.1/service-unavailable?locale=${locale}`),
    );
    const html = await response.text();

    expect(html).toContain(`lang="${locale}"`);
    expect(html).toContain(`dir="${direction}"`);
    expect(html).toContain(heading);
  });
});
