import { useColorScheme as useNativeWindColorScheme } from "nativewind";
import {
  getThemePreference,
  setThemePreference,
  type ThemePreference,
} from "@/services/secureSettings";
import { useEffect, useState } from "react";

export type ColorSchemeType = "light" | "dark";

export function useColorScheme() {
  const {
    colorScheme,
    setColorScheme: setNativeColorScheme,
    toggleColorScheme: toggleNativeColorScheme,
  } =
    useNativeWindColorScheme();
  const [themePreference, setThemePreferenceState] =
    useState<ThemePreference>("system");

  useEffect(() => {
    let mounted = true;
    void getThemePreference().then((preference) => {
      if (!mounted) return;
      setThemePreferenceState(preference);
      setNativeColorScheme(preference);
    });

    return () => {
      mounted = false;
    };
  }, [setNativeColorScheme]);

  const activeScheme: ColorSchemeType =
    colorScheme === "dark" ? "dark" : "light";

  const setColorScheme = (preference: ThemePreference) => {
    setThemePreferenceState(preference);
    setNativeColorScheme(preference);
    void setThemePreference(preference);
  };

  const toggleColorScheme = () => {
    const nextPreference = activeScheme === "dark" ? "light" : "dark";
    setColorScheme(nextPreference);
    toggleNativeColorScheme();
  };

  return {
    colorScheme: activeScheme,
    isDark: activeScheme === "dark",
    themePreference,
    setColorScheme,
    toggleColorScheme,
  };
}
