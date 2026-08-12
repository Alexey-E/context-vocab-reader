"use client";

import {
  useCallback,
  createContext,
  startTransition,
  useContext,
  useMemo,
  useRef,
  useState,
  useTransition,
  type ReactNode,
} from "react";

import { setAppTheme } from "@/features/theme/actions";
import type { AppTheme } from "@/features/theme/theme";

type ThemeContextValue = {
  isPending: boolean;
  setTheme: (theme: AppTheme) => void;
  theme: AppTheme;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

type ThemeProviderProps = Readonly<{
  children: ReactNode;
  initialTheme: AppTheme;
}>;

export function ThemeProvider({ children, initialTheme }: ThemeProviderProps) {
  const [theme, setThemeState] = useState(initialTheme);
  const [isPending, startSaving] = useTransition();
  const savingRef = useRef(false);

  const setTheme = useCallback(
    (nextTheme: AppTheme) => {
      if (nextTheme === theme || savingRef.current) return;

      const previousTheme = theme;
      savingRef.current = true;

      setThemeState(nextTheme);
      document.documentElement.dataset.theme = nextTheme;

      startSaving(async () => {
        try {
          await setAppTheme(nextTheme);
        } catch {
          startTransition(() => {
            setThemeState(previousTheme);
            document.documentElement.dataset.theme = previousTheme;
          });
        } finally {
          savingRef.current = false;
        }
      });
    },
    [theme],
  );

  const contextValue = useMemo(
    () => ({ isPending, setTheme, theme }),
    [isPending, setTheme, theme],
  );

  return <ThemeContext value={contextValue}>{children}</ThemeContext>;
}

export function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider.");
  }

  return context;
}
