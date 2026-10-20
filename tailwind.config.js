/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Cairo-Regular", "Cairo", "sans-serif"],
        cairo: ["Cairo-Regular", "Cairo", "sans-serif"],
        "cairo-light": ["Cairo-Light", "sans-serif"],
        "cairo-extralight": ["Cairo-ExtraLight", "sans-serif"],
        "cairo-medium": ["Cairo-Medium", "sans-serif"],
        "cairo-semibold": ["Cairo-SemiBold", "sans-serif"],
        "cairo-bold": ["Cairo-Bold", "sans-serif"],
        "cairo-extrabold": ["Cairo-ExtraBold", "sans-serif"],
        "cairo-black": ["Cairo-Black", "sans-serif"],
        mono: ["JetBrains Mono"],
      },

      colors: {
        // 🎨 Main Brand Colors — mapped to CSS variables for dark mode
        primary: "rgb(var(--color-primary) / <alpha-value>)",
        primaryDark: "rgb(var(--color-primary-dark) / <alpha-value>)",
        secondary: "rgb(var(--color-secondary) / <alpha-value>)",
        textPrimary: "rgb(var(--color-text-primary) / <alpha-value>)",
        textSecondary: "rgb(var(--color-text-secondary) / <alpha-value>)",
        text: "rgb(var(--color-text-primary) / <alpha-value>)",
        background: "rgb(var(--color-background) / <alpha-value>)",
        card: "rgb(var(--color-card) / <alpha-value>)",
        border: "rgb(var(--color-border) / <alpha-value>)",

        // 🎯 Surface / On-surface (MD3 semantic tokens)
        surface: "rgb(var(--color-surface) / <alpha-value>)",
        "surface-container-lowest":
          "rgb(var(--color-surface-container-lowest) / <alpha-value>)",
        surfaceContainerLowest:
          "rgb(var(--color-surface-container-lowest) / <alpha-value>)",
        "on-surface": "rgb(var(--color-on-surface) / <alpha-value>)",
        onSurface: "rgb(var(--color-on-surface) / <alpha-value>)",
        "on-surface-variant":
          "rgb(var(--color-on-surface-variant) / <alpha-value>)",
        onSurfaceVariant:
          "rgb(var(--color-on-surface-variant) / <alpha-value>)",
        "on-primary": "rgb(var(--color-on-primary) / <alpha-value>)",
        onPrimary: "rgb(var(--color-on-primary) / <alpha-value>)",
        outline: "rgb(var(--color-outline) / <alpha-value>)",
        "outline-variant": "rgb(var(--color-outline-variant) / <alpha-value>)",
        outlineVariant: "rgb(var(--color-outline-variant) / <alpha-value>)",

        // ⚪ Neutral + Status Colors
        neutralLight: "rgb(var(--color-neutral-light) / <alpha-value>)",
        backgroundElement: "rgb(var(--color-neutral-light) / <alpha-value>)",
        backgroundSelected: "rgb(var(--color-border) / <alpha-value>)",
        success: "rgb(var(--color-success) / <alpha-value>)",
        warning: "rgb(var(--color-warning) / <alpha-value>)",
        error: "rgb(var(--color-error) / <alpha-value>)",

        // Disabled states
        disabledBg: "rgb(var(--color-disabled-bg) / <alpha-value>)",
        disabledText: "rgb(var(--color-disabled-text) / <alpha-value>)",
      },

      borderRadius: {
        sm: 4,
        DEFAULT: 8,
        md: 12,
        lg: 16,
        xl: 24,
        full: 9999,
      },

      fontSize: {
        "display-lg": ["48px", { lineHeight: "56px", fontWeight: "700" }],
        "headline-lg": ["32px", { lineHeight: "40px", fontWeight: "600" }],
        "headline-lg-mobile": [
          "24px",
          { lineHeight: "32px", fontWeight: "600" },
        ],
        "headline-md": ["20px", { lineHeight: "28px", fontWeight: "600" }],
        "body-lg": ["17px", { lineHeight: "26px", fontWeight: "400" }],
        "body-md": ["15px", { lineHeight: "22px", fontWeight: "400" }],
        "label-sm": ["12px", { lineHeight: "16px", fontWeight: "500" }],
        button: ["14px", { lineHeight: "20px", fontWeight: "500" }],
      },

      spacing: {
        gutter: 24,
        "margin-desktop": 40,
        "margin-mobile": 16,
      },
    },
  },
  plugins: [],
};
