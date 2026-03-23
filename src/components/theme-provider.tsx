"use client";

import { createContext, useContext, useEffect, useState } from "react";

type Theme = "dark" | "light";

interface ThemeContextValue {
  theme: Theme;
  setTheme: (t: Theme) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: "dark",
  setTheme: () => {},
});

export function useTheme() {
  return useContext(ThemeContext);
}

function applyTheme(t: Theme) {
  const root = document.documentElement;
  root.classList.toggle("dark", t === "dark");
  root.classList.toggle("light", t === "light");
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("dark");

  // Read persisted theme on mount (defer setState to avoid cascading renders)
  useEffect(() => {
    const stored = localStorage.getItem("bm-theme") as Theme | null;
    const initial: Theme = stored === "light" ? "light" : "dark";
    applyTheme(initial);
    queueMicrotask(() => setThemeState(initial));
  }, []);

  function setTheme(t: Theme) {
    setThemeState(t);
    localStorage.setItem("bm-theme", t);
    applyTheme(t);
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
