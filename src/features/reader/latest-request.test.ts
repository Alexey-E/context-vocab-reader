import { describe, expect, it } from "vitest";

import {
  invalidateLatestRequest,
  startLatestRequest,
} from "@/features/reader/latest-request";

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((complete) => {
    resolve = complete;
  });

  return { promise, resolve };
}

describe("latest request sequence", () => {
  it("discards an older response that finishes after the latest response", async () => {
    const sequence = { current: 0 };
    const first = deferred<string>();
    const second = deferred<string>();
    const appliedResponses: string[] = [];

    async function applyIfLatest(response: Promise<string>) {
      const isLatest = startLatestRequest(sequence);
      const value = await response;

      if (isLatest()) appliedResponses.push(value);
    }

    const firstRequest = applyIfLatest(first.promise);
    const secondRequest = applyIfLatest(second.promise);

    second.resolve("second");
    await secondRequest;
    first.resolve("first");
    await firstRequest;

    expect(appliedResponses).toEqual(["second"]);
  });

  it("discards a response after the active request is invalidated", () => {
    const sequence = { current: 0 };
    const isLatest = startLatestRequest(sequence);

    invalidateLatestRequest(sequence);

    expect(isLatest()).toBe(false);
  });
});
