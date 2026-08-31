export const VOCABULARY_FIELD_LIMITS = {
  imageUrl: { maxLength: 2_048 },
  meaning: { maxCount: 10, maxLength: 500 },
  note: { maxLength: 2_000 },
  usageContext: { maxLength: 2_000 },
} as const;
