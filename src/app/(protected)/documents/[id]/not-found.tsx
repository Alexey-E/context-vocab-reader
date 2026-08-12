import { RouteNotFoundState } from "@/components/route-not-found-state";

export default function DocumentNotFound() {
  return (
    <RouteNotFoundState
      actionHref="/documents"
      actionLabel="Back to documents"
      description="It may have been deleted, or it may not belong to your account."
      title="This document is unavailable"
    />
  );
}
