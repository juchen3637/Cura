import { useEffect, useState } from "react";

export function useDarkMode() {
  const [isDark, setIsDark] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    // Check localStorage, default to light mode
    const stored = localStorage.getItem("darkMode");

    const initialDark = stored ? stored === "true" : false;
    setIsDark(initialDark);
    setIsHydrated(true);

    // Apply dark class
    if (initialDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const toggleDarkMode = () => {
    setIsDark((prev) => {
      const newValue = !prev;
      localStorage.setItem("darkMode", String(newValue));

      if (newValue) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }

      return newValue;
    });
  };

  return { isDark, toggleDarkMode, isHydrated };
}
