import { ArrowRightIcon } from "@/components/icons/arrow-icons";

type LanguagePairProps = Readonly<{
  className?: string;
  sourceLanguage: string;
  targetLanguage: string;
}>;

export function LanguagePair({
  className = "",
  sourceLanguage,
  targetLanguage,
}: LanguagePairProps) {
  return (
    <div
      className={`flex items-center gap-2 text-xs font-semibold ${className}`}
    >
      <span className="rounded-full bg-surface-muted px-2.5 py-1 text-muted">
        {sourceLanguage}
      </span>
      <ArrowRightIcon className="size-3.5 text-subtle" />
      <span className="rounded-full bg-primary-soft px-2.5 py-1 text-primary-soft-text">
        {targetLanguage}
      </span>
    </div>
  );
}
