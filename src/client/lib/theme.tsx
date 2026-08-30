"use client";

import {
  createContext,
  useContext,
  useMemo,
  type ReactNode,
} from "react";

export type ThemeMode = "dark";
export type Resolved = "dark";

type Ctx = {
  theme: ThemeMode;
  resolved: Resolved;
  setTheme: (t: ThemeMode) => void;
  toggle: () => void;
};

const ThemeCtx = createContext<Ctx | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const value = useMemo(
    () => ({
      theme: "dark" as const,
      resolved: "dark" as const,
      setTheme: () => {},
      toggle: () => {},
    }),
    [],
  );

  return <ThemeCtx.Provider value={value}>{children}</ThemeCtx.Provider>;
}

export function useTheme(): Ctx {
  const ctx = useContext(ThemeCtx);
  if (!ctx) throw new Error("useTheme must be used inside ThemeProvider");
  return ctx;
}

/** Reads a themed CSS token so canvas libraries (Chart.js) stay in sync. */
export function cssToken(name: string): string {
  return getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim();
}
