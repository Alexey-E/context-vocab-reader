import type { Instrumentation } from "next";

import { logServerError } from "@/lib/log-server-error";

export const onRequestError: Instrumentation.onRequestError = (
  error,
  request,
  context,
) => {
  const pathname = request.path.split("?", 1)[0];

  logServerError("next.request_failed", error, {
    request: {
      method: request.method,
      pathname,
    },
    route: {
      path: context.routePath,
      type: context.routeType,
    },
  });
};
