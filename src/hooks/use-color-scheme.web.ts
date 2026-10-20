import { useColorScheme as useNativeWindColorScheme } from "nativewind";
import { useSyncExternalStore } from "react";
import type { ColorSchemeType } from "./use-color-scheme";

export type { ColorSchemeType };

function emptySubscribe() {
  return () => {};
}

/**
 * Hydration-safe color scheme hook for web that syncs with NativeWind
 */
export function useColorScheme() {
  const hasHydrated = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
  const { colorScheme, setColorScheme, toggleColorScheme } =
    useNativeWindColorScheme();

  const activeScheme: ColorSchemeType =
    hasHydrated && colorScheme === "dark" ? "dark" : "light";

  return {
    colorScheme: activeScheme,
    isDark: activeScheme === "dark",
    setColorScheme,
    toggleColorScheme,
  };
}

