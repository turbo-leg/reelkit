import React, { createContext, useContext } from "react";

/**
 * Everything brand-specific lives in a theme: components never hard-code a colour or font.
 * Wrap a composition in <ReelkitTheme theme={...}> to change it; without one, the neutral
 * default theme is used.
 */
export type Theme = {
  colors: {
    /** Light scene background. */
    paper: string;
    /** Main text on paper. */
    ink: string;
    /** Dark scene background. */
    dark: string;
    /** Text on dark. */
    onDark: string;
    /** Rings, touches, highlights: the one thing that matters. */
    accent: string;
    /** The accent's lighter partner, for second lines on dark backgrounds. */
    accentSoft: string;
    /** Success states (checkmarks, "done"). */
    success: string;
  };
  fonts: {
    /** UI and display type. */
    sans: string;
    /** Optional editorial type (wordmarks, quotes). */
    serif: string;
  };
};

export const defaultTheme: Theme = {
  colors: {
    paper: "#F5F6FA",
    ink: "#0B1020",
    dark: "#0B1020",
    onDark: "#FFFFFF",
    accent: "#E5484D",
    accentSoft: "#FF8A8F",
    success: "#30A46C",
  },
  fonts: {
    sans: "Inter, system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
    serif: "Lora, Georgia, serif",
  },
};

/** Merge a partial theme over a base (default: the neutral theme). */
export const makeTheme = (
  overrides: { colors?: Partial<Theme["colors"]>; fonts?: Partial<Theme["fonts"]> },
  base: Theme = defaultTheme,
): Theme => ({
  colors: { ...base.colors, ...overrides.colors },
  fonts: { ...base.fonts, ...overrides.fonts },
});

const ThemeContext = createContext<Theme>(defaultTheme);

export const ReelkitTheme: React.FC<{ theme: Theme; children: React.ReactNode }> = ({ theme, children }) => (
  <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>
);

export const useTheme = () => useContext(ThemeContext);

/** "#RRGGBB" → "rgba(r, g, b, a)", for soft glows and shadows in the theme's colours. */
export const alpha = (hex: string, a: number) => {
  const h = hex.replace("#", "");
  const n = parseInt(h.length === 3 ? h.split("").map((c) => c + c).join("") : h, 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
};
