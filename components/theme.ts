"use client";

import { useEffect, useState } from "react";

type Theme = "light" | "dark";
const KEY = "fittrack:theme";

export function useTheme() {
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    const stored = localStorage.getItem(KEY) as Theme | null;
    const initial =
      stored ??
      (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    setTheme(initial);
  }, []);

  const toggle = () => {
    setTheme((t) => {
      const next: Theme = t === "dark" ? "light" : "dark";
      localStorage.setItem(KEY, next);
      document.documentElement.classList.toggle("dark", next === "dark");
      return next;
    });
  };

  return { theme, toggle };
}
