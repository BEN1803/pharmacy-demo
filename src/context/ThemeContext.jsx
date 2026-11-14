"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

export const THEME_STORAGE_KEY = "mediflow_theme";

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  // Read the saved theme immediately on the client so the toggle and
  // settings controls reflect the correct state after hydration.
  const [theme, setTheme] = useState(() => {
    if (typeof window === "undefined") return "dark";

    return window.localStorage.getItem(THEME_STORAGE_KEY) === "light"
      ? "light"
      : "dark";
  });

  useEffect(() => {
    const root = document.documentElement;

    root.dataset.theme = theme;
    root.style.colorScheme = theme;

    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch (error) {
      console.error("Could not save theme preference:", error);
    }
  }, [theme]);

  const toggleTheme = () =>
    setTheme((previous) => (previous === "dark" ? "light" : "dark"));

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
        toggleTheme,
        isDark: theme === "dark",
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useTheme must be used inside ThemeProvider.");
  }

  return context;
}
