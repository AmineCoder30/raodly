import { useColorScheme } from "@/hooks/use-color-scheme";
import type { ReactNode } from "react";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SafeScreen({
  children,
  classes,
}: {
  children: ReactNode;
  classes?: string;
}) {
  const { isDark } = useColorScheme();

  return (
    <SafeAreaView className={`flex-1 bg-background ${isDark ? "dark" : ""}`}>
      <View className={`flex-1 bg-background ${classes || "px-4"}`}>
        {children}
      </View>
    </SafeAreaView>
  );
}
