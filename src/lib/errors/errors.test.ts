import { createTranslator } from "next-intl";
import { describe, expect, it } from "vitest";

import ar from "@messages/ar.json";
import en from "@messages/en.json";
import es from "@messages/es.json";
import fr from "@messages/fr.json";
import ru from "@messages/ru.json";
import {
  formatErrorPayload,
  parseAppErrorCode,
  type AppErrorTranslator,
} from "@/lib/errors/catalog";

const catalogs = { ar, en, es, fr, ru } as const;

function payload(
  locale: keyof typeof catalogs,
  code: Parameters<typeof formatErrorPayload>[0],
) {
  const translate = createTranslator({
    locale,
    messages: catalogs[locale].Errors,
    namespace: undefined,
  }) as unknown as AppErrorTranslator;

  return formatErrorPayload(code, translate);
}

describe("the application error catalog", () => {
  it.each([
    ["en", "The email or password is incorrect."],
    ["ru", "Неверная электронная почта или пароль."],
    ["fr", "L’adresse e-mail ou le mot de passe est incorrect."],
    ["es", "El correo o la contraseña no son correctos."],
    ["ar", "البريد الإلكتروني أو كلمة المرور غير صحيحة."],
  ] as const)("creates a localized %s payload", (locale, message) => {
    expect(payload(locale, "auth.invalid_credentials")).toEqual({
      code: "auth.invalid_credentials",
      message,
    });
  });

  it.each([
    ["en", "Translation took too long. Please try again."],
    ["ru", "Перевод занял слишком много времени. Повторите попытку."],
    ["fr", "La traduction a pris trop de temps. Veuillez réessayer."],
    ["es", "La traducción tardó demasiado. Inténtalo de nuevo."],
    ["ar", "استغرقت الترجمة وقتًا طويلًا. يرجى المحاولة مرة أخرى."],
  ] as const)("creates a localized %s translation error", (locale, message) => {
    expect(payload(locale, "translation.timeout")).toEqual({
      code: "translation.timeout",
      message,
    });
  });

  it("formats product limits through ICU numbers", () => {
    expect(
      payload("en", "validation.document.content.too_long").message,
    ).toContain("50,000");
    expect(
      payload("fr", "validation.document.content.too_long").message,
    ).toContain("50 000");
  });

  it("ignores unknown codes from URL parameters", () => {
    expect(parseAppErrorCode("auth.oauth_callback_failed")).toBe(
      "auth.oauth_callback_failed",
    );
    expect(parseAppErrorCode("auth.made_up")).toBeUndefined();
  });
});
