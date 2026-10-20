import { useColorScheme as useNativeWindColorScheme } from "nativewind";

export type ColorSchemeType = "light" | "dark";

export function useColorScheme() {
  const { colorScheme, setColorScheme, toggleColorScheme } =
    useNativeWindColorScheme();

  const activeScheme: ColorSchemeType =
    colorScheme === "dark" ? "dark" : "light";

  return {
    colorScheme: activeScheme,
    isDark: activeScheme === "dark",
    setColorScheme,
    toggleColorScheme,
  };
}
