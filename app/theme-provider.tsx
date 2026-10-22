"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
} from "react";
import { usePathname } from "next/navigation";

export type Theme = "dark" | "light";
export const THEME_KEY = "pavan_theme";
const THEME_CHANGE_EVENT = "pavan-theme-change";

function subscribeToTheme(callback: () => void) {
  window.addEventListener(THEME_CHANGE_EVENT, callback);
  return () => window.removeEventListener(THEME_CHANGE_EVENT, callback);
}

function getThemeSnapshot(): Theme {
  return document.documentElement.dataset.theme === "light" ? "light" : "dark";
}

function getServerThemeSnapshot(): Theme {
  return "dark";
}

type ThemeCtx = {
  theme: Theme;
  dark: boolean;
  toggle: () => void;
  setTheme: (t: Theme) => void;
};

const ThemeContext = createContext<ThemeCtx>({
  theme: "dark",
  dark: true,
  toggle: () => {},
  setTheme: () => {},
});

export const useTheme = () => useContext(ThemeContext);

/** Floating sun/moon button shown on every page except the home page
 *  (the home page has its own toggle). Covers /connect and /engineering-lab/*. */
function FloatingThemeToggle() {
  const pathname = usePathname();
  const { dark, toggle } = useTheme();
  if (pathname === "/" || pathname === "/engineering-lab" || pathname === "/connect" || pathname.startsWith("/engineering-lab")) return null;
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
      title={dark ? "Switch to light mode" : "Switch to dark mode"}
      className="fixed bottom-6 right-6 z-50 flex h-12 w-12 items-center justify-center rounded-full border border-lab-fg/15 bg-lab-bg/80 text-lg shadow-xl backdrop-blur transition hover:border-lab-accent/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lab-accent"
    >
      {dark ? "☀️" : "🌙"}
    </button>
  );
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useSyncExternalStore(
    subscribeToTheme,
    getThemeSnapshot,
    getServerThemeSnapshot
  );

  const setTheme = useCallback((t: Theme) => {
    document.documentElement.dataset.theme = t;
    try {
      localStorage.setItem(THEME_KEY, t);
    } catch {}
    window.dispatchEvent(new Event(THEME_CHANGE_EVENT));
  }, []);

  const toggle = useCallback(() => {
    setTheme(theme === "light" ? "dark" : "light");
  }, [setTheme, theme]);

  const value = useMemo(
    () => ({ theme, dark: theme === "dark", toggle, setTheme }),
    [theme, toggle, setTheme]
  );

  return (
    <ThemeContext.Provider value={value}>
      {children}
      <FloatingThemeToggle />
    </ThemeContext.Provider>
  );
}