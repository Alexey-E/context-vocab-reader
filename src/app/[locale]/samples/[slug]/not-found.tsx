import { useTranslations } from "next-intl";

import { RouteNotFoundState } from "@/components/route-not-found-state";

export default function SampleNotFound() {
  const t = useTranslations("RouteStates.sampleNotFound");
  const common = useTranslations("Common");

  return (
    <RouteNotFoundState
      actionHref="/samples"
      actionLabel={common("browseSamples")}
      description={t("description")}
      title={t("title")}
    />
  );
}
