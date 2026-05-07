// src/utils/theme.js
import React, { createContext, useState, useEffect } from "react";

/**
 * ThemeContext provides current theme (light/dark)
 * and a toggle function to switch between them.
 */
export const ThemeContext = createContext({
  theme: "dark",
  toggleTheme: () => {},
});

/**
 * ThemeProvider wraps the app and:
 * - Keeps theme in state
 * - Persists theme to localStorage
 * - Applies/removes `dark` class on the <html> element
 */
export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState("dark");

  useEffect(() => {
    const root = document.documentElement;

    if (theme === "dark") {
      root.classList.add("dark:scheme-dark", "dark:bg-gray-950", "scheme-light");
      root.classList.remove("bg-white")
    } else {
      root.classList.remove("dark:scheme-dark", "dark:bg-gray-950", "scheme-light");
      root.classList.add("bg-white")
    }

    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
