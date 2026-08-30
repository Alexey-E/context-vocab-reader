export const TRANSLATION_POLICY = {
  cache: {
    maxEntries: 500,
    ttlMs: 60_000,
  },
  requestTimeoutMs: 10_000,
  text: {
    maxCodePoints: 5_000,
  },
} as const;
