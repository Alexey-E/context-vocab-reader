"use client";

import { RouteErrorState } from "@/components/route-error-state";
import { useTranslations } from "next-intl";

export default function DocumentsError({ reset }: { reset: () => void }) {
  const t = useTranslations("RouteStates.documentsError");

  return (
    <RouteErrorState
      description={t("description")}
      eyebrow={t("eyebrow")}
      onRetry={reset}
      title={t("title")}
    />
  );
}
