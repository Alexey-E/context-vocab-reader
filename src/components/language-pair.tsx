import { useLocale } from "next-intl";

import { ArrowRightIcon } from "@/components/icons/arrow-icons";
import { getLanguage, getLanguageDisplayName } from "@/lib/languages";

type LanguagePairProps = Readonly<{
  className?: string;
  sourceLanguageCode: string;
  targetLanguageCode: string;
}>;

export function LanguagePair({
  className = "",
  sourceLanguageCode,
  targetLanguageCode,
}: LanguagePairProps) {
  const locale = useLocale();
  const sourceLanguage = getLanguageDisplayName(sourceLanguageCode, locale);
  const targetLanguage = getLanguageDisplayName(targetLanguageCode, locale);

  return (
    <div
      className={`flex items-center gap-2 text-xs font-semibold ${className}`}
    >
      <span className="rounded-full bg-surface-muted px-2.5 py-1 text-muted">
        <bdi dir={getLanguage(sourceLanguageCode) ? "auto" : "ltr"}>
          {sourceLanguage}
        </bdi>
      </span>
      <ArrowRightIcon className="size-3.5 text-subtle rtl:rotate-180" />
      <span className="rounded-full bg-primary-soft px-2.5 py-1 text-primary-soft-text">
        <bdi dir={getLanguage(targetLanguageCode) ? "auto" : "ltr"}>
          {targetLanguage}
        </bdi>
      </span>
    </div>
  );
}
