import "server-only";

import { createHash } from "node:crypto";

import type {
  TranslationProviderId,
  TranslationResult,
} from "@/features/translation/contract";
import { TRANSLATION_POLICY } from "@/features/translation/constants";

type CacheEntry = Readonly<{
  expiresAt: number;
  result: TranslationResult;
}>;

type TranslationCacheOptions = Readonly<{
  maxEntries?: number;
  now?: () => number;
  ttlMs?: number;
}>;

export type CachedTranslationResult = Readonly<{
  cached: boolean;
  result: TranslationResult;
}>;

export function normalizeTranslationCacheText(text: string) {
  return text.normalize("NFC").trim().replace(/\s+/gu, " ");
}

export function createTranslationCacheKey(
  input: Readonly<{
    provider: TranslationProviderId;
    sourceLanguage: string;
    targetLanguage: string;
    text: string;
  }>,
) {
  const normalizedText = normalizeTranslationCacheText(input.text);

  return createHash("sha256")
    .update(
      JSON.stringify([
        input.provider,
        input.sourceLanguage.toLowerCase(),
        input.targetLanguage.toLowerCase(),
        normalizedText,
      ]),
    )
    .digest("hex");
}

export function createTranslationCache(options: TranslationCacheOptions = {}) {
  const entries = new Map<string, CacheEntry>();
  const pending = new Map<string, Promise<TranslationResult>>();
  const maxEntries = options.maxEntries ?? TRANSLATION_POLICY.cache.maxEntries;
  const now = options.now ?? Date.now;
  const ttlMs = options.ttlMs ?? TRANSLATION_POLICY.cache.ttlMs;

  function pruneExpired(timestamp: number) {
    for (const [key, entry] of entries) {
      if (entry.expiresAt <= timestamp) entries.delete(key);
    }
  }

  function store(key: string, result: TranslationResult) {
    while (entries.size >= maxEntries) {
      const oldestKey = entries.keys().next().value;
      if (typeof oldestKey !== "string") break;
      entries.delete(oldestKey);
    }

    entries.set(key, { expiresAt: now() + ttlMs, result });
  }

  return {
    async getOrCreate(
      key: string,
      load: () => Promise<TranslationResult>,
    ): Promise<CachedTranslationResult> {
      const timestamp = now();
      pruneExpired(timestamp);

      const existing = entries.get(key);
      if (existing) return { cached: true, result: existing.result };

      const existingRequest = pending.get(key);
      if (existingRequest) {
        return { cached: true, result: await existingRequest };
      }

      const request = load();
      pending.set(key, request);

      try {
        const result = await request;
        store(key, result);
        return { cached: false, result };
      } finally {
        pending.delete(key);
      }
    },
  };
}

export const translationCache = createTranslationCache();
