import "server-only";

import type {
  SupportedLanguage,
  SupportedLanguagesInput,
  TranslationInput,
  TranslationProvider,
} from "@/features/translation/contract";
import { TRANSLATION_POLICY } from "@/features/translation/constants";
import {
  TranslationProviderError,
  type TranslationErrorCode,
} from "@/features/translation/errors";
import {
  normalizeLanguageCode,
  validateTranslationInput,
} from "@/features/translation/validation";
import { getLanguageDirection } from "@/lib/languages";

const GOOGLE_TRANSLATE_URL =
  "https://translation.googleapis.com/language/translate/v2";
const GOOGLE_LANGUAGES_URL = `${GOOGLE_TRANSLATE_URL}/languages`;

type Fetch = typeof fetch;

type GoogleLanguagesResponse = Readonly<{
  data: Readonly<{
    languages: readonly Readonly<{ language: string; name?: string }>[];
  }>;
}>;

export type GoogleTranslationProviderOptions = Readonly<{
  apiKey: string;
  fetch?: Fetch;
  timeoutMs?: number;
}>;

function getHttpErrorCode(status: number): TranslationErrorCode {
  if (status === 400) return "invalid_request";
  if (status === 401) return "authentication";
  if (status === 403) return "permission";
  if (status === 429) return "rate_limited";
  if (status >= 500) return "unavailable";
  return "invalid_response";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function parseTranslatedText(value: unknown) {
  if (!isRecord(value) || !isRecord(value.data)) {
    throw new TranslationProviderError("invalid_response");
  }

  const translations = value.data.translations;
  if (!Array.isArray(translations) || translations.length !== 1) {
    throw new TranslationProviderError("invalid_response");
  }

  const [translation] = translations;
  if (
    !isRecord(translation) ||
    typeof translation.translatedText !== "string" ||
    !translation.translatedText.trim()
  ) {
    throw new TranslationProviderError("invalid_response");
  }

  return translation.translatedText;
}

function parseLanguagesResponse(value: unknown): GoogleLanguagesResponse {
  if (!isRecord(value) || !isRecord(value.data)) {
    throw new TranslationProviderError("invalid_response");
  }

  const languages = value.data.languages;
  if (
    !Array.isArray(languages) ||
    languages.length === 0 ||
    languages.some(
      (language) =>
        !isRecord(language) ||
        typeof language.language !== "string" ||
        !language.language.trim(),
    )
  ) {
    throw new TranslationProviderError("invalid_response");
  }

  return value as GoogleLanguagesResponse;
}

function isAbortError(error: unknown) {
  return (
    error instanceof Error &&
    (error.name === "AbortError" || error.name === "TimeoutError")
  );
}

export class GoogleTranslationProvider implements TranslationProvider {
  readonly id = "google" as const;

  private readonly apiKey: string;
  private readonly fetch: Fetch;
  private readonly timeoutMs: number;

  constructor(options: GoogleTranslationProviderOptions) {
    if (!options.apiKey.trim()) {
      throw new TranslationProviderError("configuration");
    }

    this.apiKey = options.apiKey;
    this.fetch = options.fetch ?? globalThis.fetch;
    this.timeoutMs = options.timeoutMs ?? TRANSLATION_POLICY.requestTimeoutMs;
  }

  async getSupportedLanguages(
    input: SupportedLanguagesInput = {},
  ): Promise<readonly SupportedLanguage[]> {
    const url = new URL(GOOGLE_LANGUAGES_URL);
    const displayLanguage = input.displayLanguage
      ? normalizeLanguageCode(input.displayLanguage)
      : undefined;

    if (displayLanguage) url.searchParams.set("target", displayLanguage);

    const response = await this.request(url, { method: "GET" });
    const body = parseLanguagesResponse(await this.readJson(response));

    try {
      return body.data.languages.map((language) => {
        const code = normalizeLanguageCode(language.language);

        return {
          code,
          direction: getLanguageDirection(code),
          name: language.name?.trim() || code.toUpperCase(),
        };
      });
    } catch (error) {
      throw new TranslationProviderError("invalid_response", { cause: error });
    }
  }

  async translate(input: TranslationInput) {
    const validatedInput = validateTranslationInput(input);
    const response = await this.request(new URL(GOOGLE_TRANSLATE_URL), {
      body: JSON.stringify({
        format: "text",
        q: validatedInput.text,
        source: validatedInput.sourceLanguage,
        target: validatedInput.targetLanguage,
      }),
      headers: { "Content-Type": "application/json; charset=utf-8" },
      method: "POST",
    });
    const translatedText = parseTranslatedText(await this.readJson(response));

    return {
      provider: this.id,
      translatedText,
    } as const;
  }

  private async readJson(response: Response) {
    try {
      return await response.json();
    } catch (error) {
      throw new TranslationProviderError("invalid_response", { cause: error });
    }
  }

  private async request(url: URL, init: RequestInit) {
    try {
      const response = await this.fetch(url, {
        ...init,
        headers: {
          ...init.headers,
          "X-goog-api-key": this.apiKey,
        },
        signal: AbortSignal.timeout(this.timeoutMs),
      });

      if (!response.ok) {
        throw new TranslationProviderError(getHttpErrorCode(response.status), {
          status: response.status,
        });
      }

      return response;
    } catch (error) {
      if (error instanceof TranslationProviderError) throw error;

      throw new TranslationProviderError(
        isAbortError(error) ? "timeout" : "unavailable",
        { cause: error },
      );
    }
  }
}
