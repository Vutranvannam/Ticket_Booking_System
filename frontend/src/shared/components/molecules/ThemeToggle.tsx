import { AnimatePresence, motion } from "framer-motion";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/core/theme/ThemeProvider";

function resolveTheme(theme: "dark" | "light" | "system"): "dark" | "light" {
  if (theme !== "system") return theme;
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const resolved = resolveTheme(theme);
  const isDark = resolved === "dark";

  const toggle = () => setTheme(isDark ? "light" : "dark");

  return (
    <div className="relative group">
      <button
        id="theme-toggle-btn"
        onClick={toggle}
        aria-label={isDark ? "Chuyển sang chế độ sáng" : "Chuyển sang chế độ tối"}
        className="relative p-2 rounded-full bg-surface-1 hover:bg-surface-2 border border-border text-text-secondary hover:text-text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 overflow-hidden"
      >
        <AnimatePresence mode="wait" initial={false}>
          {isDark ? (
            <motion.span
              key="moon"
              initial={{ opacity: 0, rotate: -90, scale: 0.5 }}
              animate={{ opacity: 1, rotate: 0, scale: 1 }}
              exit={{ opacity: 0, rotate: 90, scale: 0.5 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="flex"
            >
              <Moon className="h-5 w-5" />
            </motion.span>
          ) : (
            <motion.span
              key="sun"
              initial={{ opacity: 0, rotate: 90, scale: 0.5 }}
              animate={{ opacity: 1, rotate: 0, scale: 1 }}
              exit={{ opacity: 0, rotate: -90, scale: 0.5 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="flex"
            >
              <Sun className="h-5 w-5" />
            </motion.span>
          )}
        </AnimatePresence>
      </button>

      {/* Tooltip */}
      <div
        role="tooltip"
        className="pointer-events-none absolute top-full left-1/2 -translate-x-1/2 mt-2 px-2 py-1 rounded-md text-xs font-medium whitespace-nowrap
          bg-surface-1 border border-border text-text-secondary shadow-md
          opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100
          transition-all duration-150 z-50"
      >
        {isDark ? "Chế độ sáng" : "Chế độ tối"}
      </div>
    </div>
  );
}
