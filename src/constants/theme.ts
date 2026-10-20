import "@/global.css";
import { Platform } from "react-native";

import {
  DarkTheme as NavDarkTheme,
  DefaultTheme as NavDefaultTheme,
  type Theme,
} from "expo-router";

export const Colors = {
  light: {
    // 🎨 Main Brand Colors (from global.css & tailwind)
    primary: "#7B2CBF",
    primaryDark: "#5A1891",
    secondary: "#1A1A2E",
    background: "#FAF9F7",
    card: "#FFFFFF",
    border: "#E8E5E1",

    // 🎯 Surface / On-surface (MD3 semantic tokens)
    surface: "#FFFFFF",
    surfaceContainerLowest: "#FFFFFF",
    "surface-container-lowest": "#FFFFFF",
    onSurface: "#1A1A1A",
    "on-surface": "#1A1A1A",
    onSurfaceVariant: "#5C5C5C",
    "on-surface-variant": "#5C5C5C",
    onPrimary: "#FFFFFF",
    "on-primary": "#FFFFFF",
    outline: "#5C5C5C",
    outlineVariant: "#E8E5E1",
    "outline-variant": "#E8E5E1",

    // ⚪ Text & Status Colors
    textPrimary: "#1A1A1A",
    textSecondary: "#5C5C5C",
    neutralLight: "#F3F2F0",
    success: "#2ECC71",
    warning: "#FFA726",
    error: "#E53935",

    // Disabled states
    disabledBg: "#EAEAEA",
    disabledText: "#A0A0A0",

    // Backward compatibility aliases
    text: "#1A1A1A",
    backgroundElement: "#F3F2F0",
    backgroundSelected: "#E8E5E1",
  },
  dark: {
    // 🎨 Main Brand Colors (from global.css & tailwind)
    primary: "#C084FC",
    primaryDark: "#A855F7",
    secondary: "#2D2F34",
    background: "#1E1F21",
    card: "#292A2E",
    border: "#3D3F44",

    // 🎯 Surface / On-surface (MD3 semantic tokens)
    surface: "#292A2E",
    surfaceContainerLowest: "#18191B",
    "surface-container-lowest": "#18191B",
    onSurface: "#F5F5F5",
    "on-surface": "#F5F5F5",
    onSurfaceVariant: "#B5B7BD",
    "on-surface-variant": "#B5B7BD",
    onPrimary: "#1E1428",
    "on-primary": "#1E1428",
    outline: "#8A8D93",
    outlineVariant: "#3D3F44",
    "outline-variant": "#3D3F44",

    // ⚪ Text & Status Colors
    textPrimary: "#F5F5F5",
    textSecondary: "#A8ABB2",
    neutralLight: "#35363A",
    success: "#2ECC71",
    warning: "#FFA726",
    error: "#E53935",

    // Disabled states
    disabledBg: "#34363A",
    disabledText: "#777A82",

    // Backward compatibility aliases
    text: "#F5F5F5",
    backgroundElement: "#292A2E",
    backgroundSelected: "#3D3F44",
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const NavigationThemes: { light: Theme; dark: Theme } = {
  light: {
    ...NavDefaultTheme,
    dark: false,
    colors: {
      ...NavDefaultTheme.colors,
      primary: Colors.light.primary,
      background: Colors.light.background,
      card: Colors.light.card,
      text: Colors.light.textPrimary,
      border: Colors.light.border,
      notification: Colors.light.error,
    },
  },
  dark: {
    ...NavDarkTheme,
    dark: true,
    colors: {
      ...NavDarkTheme.colors,
      primary: Colors.dark.primary,
      background: Colors.dark.background,
      card: Colors.dark.card,
      text: Colors.dark.textPrimary,
      border: Colors.dark.border,
      notification: Colors.dark.error,
    },
  },
};

export const Fonts = Platform.select({
  ios: {
    sans: "Cairo-Regular",
    serif: "ui-serif",
    rounded: "ui-rounded",
    mono: "ui-monospace",
  },
  default: {
    sans: "Cairo-Regular",
    serif: "serif",
    rounded: "normal",
    mono: "monospace",
  },
  web: {
    sans: "Cairo, sans-serif",
    serif: "var(--font-serif)",
    rounded: "var(--font-rounded)",
    mono: "var(--font-mono)",
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 1280;
