import SafeScreen from "@/components/layout/global/SafeScreen";
import { router } from "expo-router";
import { useEffect } from "react";
import { Image, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from "react-native-reanimated";

export default function WelcomeScreen() {
  // Animation values
  const logoScale = useSharedValue(0.7);
  const logoOpacity = useSharedValue(0);
  const textOpacity = useSharedValue(0);
  const textTranslateY = useSharedValue(16);

  useEffect(() => {
    // Smooth entry animation
    logoOpacity.value = withTiming(1, { duration: 800 });
    logoScale.value = withSpring(1, { damping: 14, stiffness: 100 });

    textOpacity.value = withDelay(400, withTiming(1, { duration: 600 }));
    textTranslateY.value = withDelay(
      400,
      withSpring(0, { damping: 15, stiffness: 90 }),
    );

    // Redirect after 2 seconds
    const timer = setTimeout(() => {
      router.replace("/roadmaps");
    }, 2000);

    return () => clearTimeout(timer);
  }, [logoOpacity, logoScale, textOpacity, textTranslateY]);

  const animatedLogoStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ scale: logoScale.value }],
  }));

  return (
    <SafeScreen classes="p-0">
      <View className="flex-1 bg-background items-center justify-center px-6">
        {/* Glow backdrop behind logo */}
        <Animated.View
          style={animatedLogoStyle}
          className="items-center justify-center mb-6"
        >
          <View className="absolute w-44 h-44 rounded-full bg-primary/15 blur-2xl" />
          <View className="w-28 h-28 rounded-3xl bg-card border border-border/60 items-center justify-center shadow-lg p-2">
            <Image
              source={require("@/assets/images/image.png")}
              className="w-24 h-24 rounded-2xl"
              resizeMode="contain"
            />
          </View>
        </Animated.View>

        {/* Subtle bottom indicator */}
        <View className="absolute bottom-12 items-center">
          <View className="w-6 h-1 rounded-full bg-primary/40 animate-pulse" />
        </View>
      </View>
    </SafeScreen>
  );
}
