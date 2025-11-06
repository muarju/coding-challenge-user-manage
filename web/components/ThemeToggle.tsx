"use client";
import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const fromDom =
      (document.documentElement.dataset.theme as
        | "light"
        | "dark"
        | undefined) || undefined;
    if (fromDom && fromDom !== theme) setTheme(fromDom);
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    document.documentElement.dataset.theme = theme;
    document.documentElement.setAttribute("data-bs-theme", theme);
    try {
      localStorage.setItem("theme", theme);
    } catch {}
  }, [theme, mounted]);

  const toggle = () => setTheme((t) => (t === "light" ? "dark" : "light"));

  return (
    <span className="d-inline-flex align-items-center">
      <button
        type="button"
        className={`theme-switch ${mounted ? theme : "light"}`}
        aria-label="Toggle theme"
        role="switch"
        aria-checked={theme === "dark"}
        onClick={toggle}
      >
        <span className="track" />
        <span className="thumb" />
        <span className="visually-hidden">
          {theme === "dark" ? "Dark" : "Light"}
        </span>
      </button>
      <span className="ms-2 small">
        {mounted ? (theme === "dark" ? "Dark" : "Light") : ""}
      </span>
    </span>
  );
}
