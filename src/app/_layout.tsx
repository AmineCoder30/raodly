import "@/global.css";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { useFonts } from "expo-font";
import { NavigationBar } from "expo-navigation-bar";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import * as Updates from "expo-updates";
import { useEffect } from "react";
import { DevSettings, I18nManager, Platform } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useColorScheme();

  const [fontsLoaded, fontError] = useFonts({
    Cairo: require("@/assets/fonts/Cairo-Regular.ttf"),
    "Cairo-Regular": require("@/assets/fonts/Cairo-Regular.ttf"),
    "Cairo-Medium": require("@/assets/fonts/Cairo-Medium.ttf"),
    "Cairo-SemiBold": require("@/assets/fonts/Cairo-SemiBold.ttf"),
    "Cairo-Bold": require("@/assets/fonts/Cairo-Bold.ttf"),
    "Cairo-ExtraBold": require("@/assets/fonts/Cairo-ExtraBold.ttf"),
    "Cairo-Black": require("@/assets/fonts/Cairo-Black.ttf"),
    "Cairo-Light": require("@/assets/fonts/Cairo-Light.ttf"),
    "Cairo-ExtraLight": require("@/assets/fonts/Cairo-ExtraLight.ttf"),
  });

  useEffect(() => {
    if (!I18nManager.isRTL) {
      I18nManager.allowRTL(true);
      I18nManager.forceRTL(true);

      // forceRTL only applies after a restart
      if (__DEV__) {
        DevSettings.reload();
      } else {
        Updates.reloadAsync();
      }
    }

    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <BottomSheetModalProvider>
        {Platform.OS === "android" && (
          <NavigationBar style={"auto"} hidden={true} />
        )}
        <StatusBar style={"auto"} />
        <Stack
          screenOptions={{
            headerShown: false,
          }}
        >
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="roadmaps" options={{ headerShown: false }} />
          <Stack.Screen name="settings" options={{ headerShown: false }} />
          <Stack.Screen name="roadmap/[id]" options={{ headerShown: false }} />
        </Stack>
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
  );
}
