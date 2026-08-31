import { describe, expect, it } from "vitest";

import { isReaderWordActivationKey } from "@/features/reader/word-activation";

describe("isReaderWordActivationKey", () => {
  it.each(["Enter", " "])("accepts %j", (key) => {
    expect(isReaderWordActivationKey(key)).toBe(true);
  });

  it.each(["Escape", "Tab", "Space"])("rejects %j", (key) => {
    expect(isReaderWordActivationKey(key)).toBe(false);
  });
});
