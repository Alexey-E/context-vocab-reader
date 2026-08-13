import { describe, expect, it } from "vitest";

import ar from "@messages/ar.json";
import en from "@messages/en.json";
import es from "@messages/es.json";
import fr from "@messages/fr.json";
import ru from "@messages/ru.json";

type MessageCatalog = Readonly<Record<string, unknown>>;

const TRANSLATED_CATALOGS = { ar, es, fr, ru } as const;

function flattenMessages(
  catalog: MessageCatalog,
  prefix = "",
): Map<string, string> {
  const messages = new Map<string, string>();

  for (const [key, value] of Object.entries(catalog)) {
    const path = prefix ? `${prefix}.${key}` : key;

    if (typeof value === "string") {
      messages.set(path, value);
    } else if (value && typeof value === "object" && !Array.isArray(value)) {
      flattenMessages(value as MessageCatalog, path).forEach(
        (message, nestedPath) => messages.set(nestedPath, message),
      );
    } else {
      throw new TypeError(`Message "${path}" must be a string.`);
    }
  }

  return messages;
}

function getIcuArguments(message: string) {
  return [...message.matchAll(/\{([A-Za-z][\w]*)(?:[,}])/g)]
    .map((match) => match[1])
    .sort();
}

const referenceMessages = flattenMessages(en);

describe.each(Object.entries(TRANSLATED_CATALOGS))(
  "%s message catalog",
  (_locale, catalog) => {
    const translatedMessages = flattenMessages(catalog);

    it("contains exactly the English message keys", () => {
      const referenceKeys = new Set(referenceMessages.keys());
      const translatedKeys = new Set(translatedMessages.keys());

      expect({
        extra: [...translatedKeys].filter((key) => !referenceKeys.has(key)),
        missing: [...referenceKeys].filter((key) => !translatedKeys.has(key)),
      }).toEqual({ extra: [], missing: [] });
    });

    it("contains no blank messages", () => {
      const blank = [...translatedMessages]
        .filter(([, message]) => message.trim().length === 0)
        .map(([key]) => key);

      expect(blank).toEqual([]);
    });

    it("uses the same ICU arguments as English", () => {
      const mismatches = [...referenceMessages].flatMap(
        ([key, referenceMessage]) => {
          const translatedMessage = translatedMessages.get(key);

          if (translatedMessage === undefined) return [];

          const expected = getIcuArguments(referenceMessage);
          const received = getIcuArguments(translatedMessage);

          return expected.join() === received.join()
            ? []
            : [{ expected, key, received }];
        },
      );

      expect(mismatches).toEqual([]);
    });
  },
);
