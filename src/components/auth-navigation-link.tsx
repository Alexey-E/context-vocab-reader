import { getTranslations } from "next-intl/server";

import { Link } from "@/i18n/navigation";
import { getAuthContext } from "@/lib/auth/require-user";

type AuthNavigationLinkProps = Readonly<{
  className: string;
}>;

export async function AuthNavigationLink({
  className,
}: AuthNavigationLinkProps) {
  const { authenticated } = await getAuthContext();
  const t = await getTranslations("Common");

  return (
    <Link href={authenticated ? "/account" : "/login"} className={className}>
      {authenticated ? t("account") : t("signIn")}
    </Link>
  );
}
