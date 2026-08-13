"use client";

import { useLocale, useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { useTransition } from "react";
import {
  Button,
  Menu,
  MenuItem,
  MenuTrigger,
  Popover,
} from "react-aria-components";

import { usePathname, useRouter } from "@/i18n/navigation";
import {
  APP_LOCALES,
  getLocaleDirection,
  type AppLocale,
} from "@/i18n/routing";

const LOCALE_OPTIONS: ReadonlyArray<
  Readonly<{ code: string; label: string; locale: AppLocale }>
> = [
  { code: "EN", label: "English", locale: "en" },
  { code: "RU", label: "Русский", locale: "ru" },
  { code: "FR", label: "Français", locale: "fr" },
  { code: "ES", label: "Español", locale: "es" },
  { code: "AR", label: "العربية", locale: "ar" },
];

type LanguageSwitcherProps = Readonly<{
  inverse?: boolean;
}>;

export function LanguageSwitcher({ inverse = false }: LanguageSwitcherProps) {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations("LocaleSwitcher");
  const [isPending, startTransition] = useTransition();
  const current =
    LOCALE_OPTIONS.find((option) => option.locale === locale) ??
    LOCALE_OPTIONS[0];

  function chooseLocale(nextLocale: AppLocale) {
    if (nextLocale === locale || isPending) return;

    const query = searchParams.toString();
    const hash = window.location.hash;
    const href = `${pathname}${query ? `?${query}` : ""}${hash}`;

    startTransition(() => {
      router.replace(href, { locale: nextLocale });
    });
  }

  return (
    <div className="shrink-0">
      <MenuTrigger>
        <Button
          aria-label={t("label", { language: current.label })}
          isPending={isPending}
          className={`inline-flex size-10 cursor-pointer items-center justify-center rounded-full border text-[11px] font-bold tracking-wide transition outline-none data-focus-visible:outline-2 data-focus-visible:outline-offset-2 data-focus-visible:outline-solid data-focus-visible:outline-primary ${
            inverse
              ? "border-inverse-border text-inverse-text hover:bg-inverse-muted"
              : "border-border text-muted hover:bg-surface-muted hover:text-text"
          }`}
        >
          <span dir="ltr">{current.code}</span>
        </Button>

        <Popover
          placement="bottom end"
          offset={8}
          className="z-50 w-44 max-w-[calc(100vw-2rem)] rounded-2xl border border-border bg-surface p-2 text-text shadow-xl"
        >
          <Menu
            aria-label={t("menuLabel")}
            selectionMode="single"
            selectedKeys={[locale]}
            shouldCloseOnSelect
            className="outline-none"
          >
            {APP_LOCALES.map((optionLocale) => {
              const option = LOCALE_OPTIONS.find(
                (candidate) => candidate.locale === optionLocale,
              );

              if (!option) return null;

              return (
                <MenuItem
                  key={option.locale}
                  id={option.locale}
                  textValue={option.label}
                  lang={option.locale}
                  dir={getLocaleDirection(option.locale)}
                  onAction={() => chooseLocale(option.locale)}
                  className="flex min-h-10 w-full cursor-pointer items-center justify-between gap-3 rounded-xl px-3 text-sm font-semibold text-muted transition outline-none hover:bg-surface-muted hover:text-text data-focus-visible:bg-surface-muted data-focus-visible:text-text data-focus-visible:outline-2 data-focus-visible:outline-solid data-focus-visible:outline-primary data-selected:bg-selected data-selected:text-selected-text"
                >
                  <span>{option.label}</span>
                  <span dir="ltr" className="text-[10px] text-subtle">
                    {option.code}
                  </span>
                </MenuItem>
              );
            })}
          </Menu>
        </Popover>
      </MenuTrigger>
    </div>
  );
}
