"use client";

import { RouteErrorState } from "@/components/route-error-state";

export default function DocumentsError({ reset }: { reset: () => void }) {
  return (
    <RouteErrorState
      description="Please try again. Your saved documents have not been changed."
      eyebrow="Library unavailable"
      onRetry={reset}
      title="Your documents could not be loaded"
    />
  );
}
