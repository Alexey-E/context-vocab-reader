"use client";

import { useEffect, useRef } from "react";
import {
  Button,
  Menu,
  MenuItem,
  MenuTrigger,
  Popover,
} from "react-aria-components";

import { APP_THEMES, type AppTheme } from "@/features/theme/theme";
import { useTheme } from "@/features/theme/theme-provider";

const THEME_LABELS: Record<AppTheme, string> = {
  dark: "Dark",
  light: "Light",
  system: "System",
};

function ThemeIcon({ theme }: Readonly<{ theme: AppTheme }>) {
  if (theme === "light") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="size-5">
        <circle
          cx="12"
          cy="12"
          r="3.5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
        />
        <path
          d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.28 5.28l1.42 1.42M17.3 17.3l1.42 1.42M18.72 5.28 17.3 6.7M6.7 17.3l-1.42 1.42"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeWidth="1.8"
        />
      </svg>
    );
  }

  if (theme === "dark") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="size-5">
        <path
          d="M20.2 15.1A8.4 8.4 0 0 1 8.9 3.8 8.5 8.5 0 1 0 20.2 15.1Z"
          fill="none"
          stroke="currentColor"
          strokeLinejoin="round"
          strokeWidth="1.8"
        />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="size-5">
      <circle
        cx="12"
        cy="12"
        r="5.25"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path d="M12 6.75a5.25 5.25 0 0 1 0 10.5Z" fill="currentColor" />
      <path
        d="M12 2.5v1.75M12 19.75v1.75M2.5 12h1.75M19.75 12h1.75M5.28 5.28l1.24 1.24M17.48 17.48l1.24 1.24M18.72 5.28l-1.24 1.24M6.52 17.48l-1.24 1.24"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.6"
      />
    </svg>
  );
}

type ThemeSwitcherProps = Readonly<{
  inverse?: boolean;
}>;

export function ThemeSwitcher({ inverse = false }: ThemeSwitcherProps) {
  const { isPending, setTheme, theme } = useTheme();
  const pendingThemeRef = useRef<AppTheme | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isPending || pendingThemeRef.current === null) return;

    pendingThemeRef.current = null;
    triggerRef.current?.focus();
  }, [isPending]);

  function chooseTheme(nextTheme: AppTheme) {
    if (nextTheme === theme || pendingThemeRef.current === nextTheme) return;

    pendingThemeRef.current = nextTheme;
    setTheme(nextTheme);
  }

  return (
    <div className="shrink-0">
      <MenuTrigger>
        <Button
          ref={triggerRef}
          aria-label={`Theme: ${THEME_LABELS[theme]}`}
          className={`inline-flex size-10 cursor-pointer items-center justify-center rounded-full border transition outline-none data-focus-visible:outline-2 data-focus-visible:outline-offset-2 data-focus-visible:outline-solid data-focus-visible:outline-primary ${
            inverse
              ? "border-inverse-border text-inverse-text hover:bg-inverse-muted"
              : "border-border text-muted hover:bg-surface-muted hover:text-text"
          }`}
        >
          <ThemeIcon theme={theme} />
        </Button>

        <Popover
          isNonModal
          placement="bottom end"
          offset={8}
          className="z-50 w-40 rounded-2xl border border-border bg-surface p-2 text-text shadow-xl"
        >
          <div
            onKeyDownCapture={(event) => {
              if (event.code !== "Space") return;

              const activeElement = document.activeElement;
              if (!(activeElement instanceof HTMLElement)) return;

              const nextTheme = APP_THEMES.find(
                (option) => option === activeElement.dataset.themeOption,
              );
              if (!nextTheme) return;

              chooseTheme(nextTheme);
            }}
          >
            <Menu
              aria-label="Color theme"
              selectionMode="single"
              selectedKeys={[theme]}
              shouldCloseOnSelect
              className="outline-none"
            >
              {APP_THEMES.map((option) => (
                <MenuItem
                  key={option}
                  id={option}
                  data-theme-option={option}
                  textValue={THEME_LABELS[option]}
                  onAction={() => chooseTheme(option)}
                  className="flex min-h-10 w-full cursor-pointer items-center gap-3 rounded-xl px-3 text-sm font-semibold text-muted transition outline-none hover:bg-surface-muted hover:text-text data-focus-visible:bg-surface-muted data-focus-visible:text-text data-focus-visible:outline-2 data-focus-visible:outline-solid data-focus-visible:outline-primary data-selected:bg-selected data-selected:text-selected-text"
                >
                  <ThemeIcon theme={option} />
                  {THEME_LABELS[option]}
                </MenuItem>
              ))}
            </Menu>
          </div>
        </Popover>
      </MenuTrigger>
    </div>
  );
}
