import type { Instrumentation } from "next";

export const onRequestError: Instrumentation.onRequestError = (
  error,
  request,
  context,
) => {
  const pathname = request.path.split("?", 1)[0];
  const details =
    error instanceof Error
      ? {
          digest:
            "digest" in error && typeof error.digest === "string"
              ? error.digest
              : undefined,
          message: error.message,
          name: error.name,
          stack: error.stack,
        }
      : {
          message: String(error),
        };

  console.error("Unhandled server request error", {
    error: details,
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
