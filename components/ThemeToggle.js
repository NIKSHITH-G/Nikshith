"use client";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="w-10 h-10 flex items-center justify-center rounded-full 
                 bg-gray-200 dark:bg-gray-800 shadow-md transition-colors duration-500"
    >
      {theme === "dark" ? (
        <Moon className="w-6 h-6 text-yellow-300 transition-transform duration-500" />
      ) : (
        <Sun className="w-6 h-6 text-orange-500 transition-transform duration-500" />
      )}
    </button>
  );
}
