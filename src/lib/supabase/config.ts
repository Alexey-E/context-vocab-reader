export function getSupabaseConfig() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabasePublishableKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!supabaseUrl || !supabasePublishableKey) {
    const missingVariables = [
      !supabaseUrl && "NEXT_PUBLIC_SUPABASE_URL",
      !supabasePublishableKey && "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
    ].filter((name): name is string => Boolean(name));

    throw new Error(
      `Missing required environment variables: ${missingVariables.join(", ")}.`,
    );
  }

  return {
    publishableKey: supabasePublishableKey,
    url: supabaseUrl,
  };
}
