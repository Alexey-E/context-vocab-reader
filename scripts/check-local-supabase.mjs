const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

function fail(message) {
  console.error(`\n${message}\n`);
  process.exitCode = 1;
}

if (!supabaseUrl) {
  fail(
    [
      "Local development cannot start because NEXT_PUBLIC_SUPABASE_URL is missing.",
      "Add it to .env.local and run pnpm dev again.",
    ].join("\n\n"),
  );
} else {
  let url;

  try {
    url = new URL(supabaseUrl);
  } catch {
    fail(
      `Local development cannot start because NEXT_PUBLIC_SUPABASE_URL is invalid: ${supabaseUrl}`,
    );
  }

  if (url && ["127.0.0.1", "localhost"].includes(url.hostname)) {
    try {
      const response = await fetch(new URL("/auth/v1/health", url), {
        signal: AbortSignal.timeout(3_000),
      });

      if (!response.ok) {
        throw new Error(`Health check returned HTTP ${response.status}.`);
      }
    } catch {
      fail(
        [
          `Local Supabase is unavailable at ${url.origin}.`,
          "Start it before running the application:",
          "  podman machine start",
          '  export DOCKER_HOST="unix://${HOME}/.local/share/containers/podman/machine/podman.sock"',
          "  pnpm supabase start",
          "",
          "Then run pnpm dev again.",
        ].join("\n"),
      );
    }
  }
}
