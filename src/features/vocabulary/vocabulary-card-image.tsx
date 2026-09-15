"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

export function VocabularyCardImage({
  imageUrl,
  word,
}: Readonly<{ imageUrl: string | null; word: string }>) {
  const t = useTranslations("Vocabulary");
  const [broken, setBroken] = useState(false);

  return (
    <div className="flex aspect-[16/9] items-center justify-center overflow-hidden bg-surface-muted">
      {imageUrl && !broken ? (
        // Arbitrary user-provided remote hosts cannot use next/image.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={imageUrl}
          alt={t("imageAlt", { word })}
          onError={() => setBroken(true)}
          className="size-full object-cover"
        />
      ) : (
        <div
          className="px-5 text-center text-sm text-subtle"
          role="img"
          aria-label={t("imageFallback", { word })}
        >
          <span
            aria-hidden="true"
            className="mx-auto mb-2 flex size-10 items-center justify-center rounded-full bg-surface text-lg font-bold text-muted"
          >
            {word.trim().charAt(0).toLocaleUpperCase() || "?"}
          </span>
          {imageUrl ? t("imageBroken") : t("imageMissing")}
        </div>
      )}
    </div>
  );
}
