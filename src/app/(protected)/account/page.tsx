import type { Metadata } from "next";
import { revalidatePath } from "next/cache";
import Link from "next/link";
import { redirect, RedirectType } from "next/navigation";

import { requireUser } from "@/lib/auth/require-user";
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

  const { claims } = await requireUser();
  const email = typeof claims.email === "string" ? claims.email : null;

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
          The authenticated session is active. Open your private documents or
          explore a public sample.
        </p>
        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          <Link
            href="/documents"
            className="inline-flex min-h-12 items-center justify-center rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
          >
            My documents
          </Link>
          <Link
            href="/samples"
            className="inline-flex min-h-12 items-center justify-center rounded-xl border border-slate-300 bg-white px-5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-700"
          >
            Browse samples
          </Link>
        </div>
        <form action={signOut} className="mt-3">
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
