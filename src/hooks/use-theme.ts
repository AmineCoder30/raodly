import { Colors } from "@/constants/theme";
import { type ColorSchemeType, useColorScheme } from "@/hooks/use-color-scheme";

export type ThemeColors = (typeof Colors)[ColorSchemeType];

export type UseThemeReturn = ThemeColors & {
  colors: ThemeColors;
  colorScheme: ColorSchemeType;
  isDark: boolean;
  setColorScheme: ReturnType<typeof useColorScheme>["setColorScheme"];
  toggleColorScheme: ReturnType<typeof useColorScheme>["toggleColorScheme"];
};

export function useTheme(): UseThemeReturn {
  const { colorScheme, isDark, setColorScheme, toggleColorScheme } =
    useColorScheme();
  const colors = Colors[colorScheme];

  return {
    ...colors,
    colors,
    colorScheme,
    isDark,
    setColorScheme,
    toggleColorScheme,
  };
}

