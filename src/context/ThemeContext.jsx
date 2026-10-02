import { createContext, useContext, useState } from "react";

// Created once at module scope (never inside a component).
export const ThemeContext = createContext(null);

// The theme state lives inside the provider; consumers only receive the value.
export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState("light");

  const toggleTheme = () =>
    setTheme(previous => (previous === "light" ? "dark" : "light"));

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

// Custom hook: reads the context and fails loudly if no provider is above.
export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === null) {
    throw new Error("useTheme must be used inside a <ThemeProvider>.");
  }
  return context;
}
