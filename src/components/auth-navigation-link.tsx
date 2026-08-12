import Link from "next/link";

import { getAuthContext } from "@/lib/auth/require-user";

type AuthNavigationLinkProps = Readonly<{
  className: string;
}>;

export async function AuthNavigationLink({
  className,
}: AuthNavigationLinkProps) {
  const { authenticated } = await getAuthContext();

  return (
    <Link href={authenticated ? "/account" : "/login"} className={className}>
      {authenticated ? "Account" : "Sign in"}
    </Link>
  );
}
