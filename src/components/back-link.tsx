import Link from "next/link";

import { ArrowLeftIcon } from "@/components/icons/arrow-icons";

type BackLinkProps = Readonly<{
  href: string;
  label: string;
}>;

export function BackLink({ href, label }: BackLinkProps) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-2 text-sm font-semibold text-muted hover:text-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
    >
      <ArrowLeftIcon />
      {label}
    </Link>
  );
}
