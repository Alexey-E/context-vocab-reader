type ErrorDetails = {
  cause?: ErrorDetails;
  code?: string | number;
  digest?: string;
  message: string;
  name?: string;
  stack?: string;
  status?: string | number;
};

function readScalar(
  value: Record<string, unknown>,
  property: "code" | "digest" | "status",
) {
  const candidate = value[property];

  return typeof candidate === "string" || typeof candidate === "number"
    ? candidate
    : undefined;
}

function serializeError(
  error: unknown,
  depth = 0,
  seen = new Set<unknown>(),
): ErrorDetails {
  if (typeof error !== "object" || error === null) {
    return { message: String(error) };
  }

  if (seen.has(error)) {
    return { message: "[Circular error cause]" };
  }

  seen.add(error);

  const value = error as Record<string, unknown>;
  const message =
    typeof value.message === "string" ? value.message : String(error);
  const cause = value.cause;
  const digest = readScalar(value, "digest");

  return {
    cause:
      cause !== undefined && depth < 2
        ? serializeError(cause, depth + 1, seen)
        : undefined,
    code: readScalar(value, "code"),
    digest: typeof digest === "string" ? digest : undefined,
    message,
    name: typeof value.name === "string" ? value.name : undefined,
    stack: typeof value.stack === "string" ? value.stack : undefined,
    status: readScalar(value, "status"),
  };
}

export function logServerError(
  event: string,
  error: unknown,
  context: Record<string, unknown>,
) {
  console.error(
    JSON.stringify({
      context,
      error: serializeError(error),
      event,
    }),
  );
}
