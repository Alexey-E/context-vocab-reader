import { describe, expect, it } from "vitest";

import { GET } from "./route";

describe("service unavailable response", () => {
  it("returns a non-cacheable 503 page that clients may retry", async () => {
    const response = GET(new Request("http://127.0.0.1/service-unavailable"));

    expect(response.status).toBe(503);
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(response.headers.get("retry-after")).toBe("60");
    expect(await response.text()).toContain(
      "The service is currently unavailable",
    );
  });

  it("uses a valid persisted application theme", async () => {
    const response = GET(
      new Request("http://127.0.0.1/service-unavailable", {
        headers: { cookie: "app-theme=dark" },
      }),
    );

    expect(await response.text()).toContain('data-theme="dark"');
  });
});
