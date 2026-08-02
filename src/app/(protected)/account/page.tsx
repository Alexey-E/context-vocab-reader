import type { Metadata } from "next";
import { revalidatePath } from "next/cache";
import { redirect, RedirectType } from "next/navigation";

import { createErrorPayload } from "@/lib/errors/catalog";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Account",
};

export default async function AccountPage() {
  async function signOut() {
    "use server";

    const supabase = await createClient();
    const { error } = await supabase.auth.signOut({ scope: "local" });
    const destination = error
      ? `/login?error=${createErrorPayload("auth.signout_failed").code}`
      : "/login";

    revalidatePath("/", "layout");
    redirect(destination, RedirectType.replace);
  }

  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const email =
    typeof data?.claims?.email === "string" ? data.claims.email : null;

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6 py-16">
      <section className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-10 shadow-sm">
        <p className="text-sm font-semibold tracking-[0.08em] text-blue-600 uppercase">
          Context Vocab Reader
        </p>
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-900">
          You are signed in
        </h1>
        {email && <p className="mt-3 text-slate-600">{email}</p>}
        <p className="mt-8 text-sm leading-6 text-slate-500">
          The authenticated session is active. Your private reader and
          vocabulary will appear here in the next implementation stage.
        </p>
        <form action={signOut} className="mt-8">
          <button
            type="submit"
            className="inline-flex h-12 w-full cursor-pointer items-center justify-center rounded-xl bg-slate-900 px-5 font-semibold text-white transition-colors hover:bg-slate-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900"
          >
            Sign out
          </button>
        </form>
      </section>
    </main>
  );
}
