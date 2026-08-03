import "server-only";

const DEFAULT_APP_URL = "http://127.0.0.1:3000";

export function getAppUrl() {
  const configuredUrl =
    process.env.VERCEL_ENV === "preview" && process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : process.env.NEXT_PUBLIC_APP_URL;

  if (!configuredUrl && process.env.NODE_ENV === "production") {
    throw new Error(
      "Missing NEXT_PUBLIC_APP_URL. Set it to the public application origin in production.",
    );
  }

  let url: URL;

  try {
    url = new URL(configuredUrl || DEFAULT_APP_URL);
  } catch {
    throw new Error(
      `Invalid application URL "${configuredUrl}". Set NEXT_PUBLIC_APP_URL to an absolute http(s) URL.`,
    );
  }

  if (
    (url.protocol !== "http:" && url.protocol !== "https:") ||
    url.username ||
    url.password
  ) {
    throw new Error(
      "NEXT_PUBLIC_APP_URL must be an absolute http(s) origin without credentials.",
    );
  }

  return url.origin;
}

export function createAppUrl(path: string) {
  return new URL(path, getAppUrl());
}
