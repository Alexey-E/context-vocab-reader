import { afterEach, describe, expect, it, vi } from "vitest";

import { logServerError } from "@/lib/log-server-error";

describe("logServerError", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("writes one searchable JSON entry including nested error causes", () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);
    const cause = Object.assign(new Error("Connection refused"), {
      code: "ECONNREFUSED",
    });
    const error = new Error("Supabase request failed", { cause });

    logServerError("proxy.session_refresh_failed", error, {
      request: { method: "GET", pathname: "/login" },
    });

    expect(consoleError).toHaveBeenCalledOnce();
    expect(JSON.parse(String(consoleError.mock.calls[0][0]))).toMatchObject({
      context: {
        request: { method: "GET", pathname: "/login" },
      },
      error: {
        cause: {
          code: "ECONNREFUSED",
          message: "Connection refused",
        },
        message: "Supabase request failed",
      },
      event: "proxy.session_refresh_failed",
    });
  });
});
