import { useTranslations } from "next-intl";

import { RouteNotFoundState } from "@/components/route-not-found-state";

export default function DocumentNotFound() {
  const t = useTranslations("RouteStates.documentNotFound");
  const common = useTranslations("Common");

  return (
    <RouteNotFoundState
      actionHref="/documents"
      actionLabel={common("backToDocuments")}
      description={t("description")}
      title={t("title")}
    />
  );
}
