"use client";

import { I18nProvider } from "react-aria-components";

type ReactAriaProviderProps = Readonly<{
  children: React.ReactNode;
  locale: string;
}>;

export function ReactAriaProvider({
  children,
  locale,
}: ReactAriaProviderProps) {
  return <I18nProvider locale={locale}>{children}</I18nProvider>;
}
