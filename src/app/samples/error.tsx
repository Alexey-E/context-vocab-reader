"use client";

import { RouteErrorState } from "@/components/route-error-state";

export default function SamplesError({ reset }: { reset: () => void }) {
  return (
    <RouteErrorState
      description="Please try again. Your request did not change any saved data."
      eyebrow="Library unavailable"
      onRetry={reset}
      title="Sample texts could not be loaded"
    />
  );
}
