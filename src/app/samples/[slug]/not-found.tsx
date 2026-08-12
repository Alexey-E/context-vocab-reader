import { RouteNotFoundState } from "@/components/route-not-found-state";

export default function SampleNotFound() {
  return (
    <RouteNotFoundState
      actionHref="/samples"
      actionLabel="Browse samples"
      description="It may have been removed, or the link may be incorrect."
      title="This sample is unavailable"
    />
  );
}
