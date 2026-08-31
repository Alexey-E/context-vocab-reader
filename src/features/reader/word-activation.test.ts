import { describe, expect, it } from "vitest";

import {
  isReaderWordActivationKey,
  shouldActivateReaderWordFromClick,
} from "@/features/reader/word-activation";

describe("isReaderWordActivationKey", () => {
  it.each(["Enter", " "])("accepts %j", (key) => {
    expect(isReaderWordActivationKey(key)).toBe(true);
  });

  it.each(["Escape", "Tab", "Space"])("rejects %j", (key) => {
    expect(isReaderWordActivationKey(key)).toBe(false);
  });
});

describe("shouldActivateReaderWordFromClick", () => {
  it("activates ordinary pointer clicks and synthetic assistive clicks", () => {
    expect(shouldActivateReaderWordFromClick(1, true)).toBe(true);
    expect(shouldActivateReaderWordFromClick(0, false)).toBe(true);
  });

  it("leaves a pointer drag selection intact", () => {
    expect(shouldActivateReaderWordFromClick(1, false)).toBe(false);
  });
});
