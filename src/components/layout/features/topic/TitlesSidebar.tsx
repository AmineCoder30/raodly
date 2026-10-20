import { CheckCircle2, Circle, X } from "lucide-react-native";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Easing,
  Modal,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export type Topic = {
  id: string;
  title: string;
  completed?: boolean;
};

export type TopicSection = {
  id: string;
  title: string;
  topics: Topic[];
};

type Props = {
  visible: boolean;
  onClose: () => void;
  sections: TopicSection[];
  activeId: string;
  onSelect: (topic: Topic) => void;
};

const SCREEN_WIDTH = Dimensions.get("window").width;
const SIDEBAR_WIDTH = Math.min(SCREEN_WIDTH * 0.82, 340);

const C = {
  primary: "#B4B7FF",
  muted: "#A1A1AA",
  success: "#86EFAC",
  text: "#E4E4E7",
};

export default function TopicsSidebar({
  visible,
  onClose,
  sections,
  activeId,
  onSelect,
}: Props) {
  const insets = useSafeAreaInsets();
  const progress = useRef(new Animated.Value(0)).current;
  // Keep the Modal mounted until the close animation finishes
  const [mounted, setMounted] = useState(visible);

  useEffect(() => {
    if (visible) {
      setMounted(true);

      // let the Modal mount and lay out before animating
      let raf2: number;
      const raf1 = requestAnimationFrame(() => {
        raf2 = requestAnimationFrame(() => {
          Animated.timing(progress, {
            toValue: 1,
            duration: 280,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }).start();
        });
      });

      return () => {
        cancelAnimationFrame(raf1);
        cancelAnimationFrame(raf2);
      };
    }

    Animated.timing(progress, {
      toValue: 0,
      duration: 200,
      easing: Easing.in(Easing.cubic),
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) setMounted(false);
    });
  }, [visible, progress]);

  const translateX = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [SIDEBAR_WIDTH, 0],
  });

  const totalTopics = sections.reduce((n, s) => n + s.topics.length, 0);
  const doneTopics = sections.reduce(
    (n, s) => n + s.topics.filter((t) => t.completed).length,
    0,
  );

  return (
    <Modal
      visible={mounted}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View className="flex-1">
        {/* Backdrop */}
        <Animated.View
          style={{ opacity: progress }}
          className="absolute inset-0 bg-black/60"
        >
          <Pressable className="flex-1" onPress={onClose} />
        </Animated.View>

        {/* Panel */}
        <Animated.View
          style={{
            width: SIDEBAR_WIDTH,
            transform: [{ translateX }],
            paddingTop: insets.top,
            paddingBottom: insets.bottom,
          }}
          className="absolute bottom-0 left-0 top-0 border-r border-border bg-background"
        >
          {/* Header */}
          <View className="flex-row items-center justify-between border-b border-border px-margin-mobile py-4">
            <View>
              <Text className="text-headline-md font-cairo-bold font-bold text-textPrimary text-start">
                المواضيع
              </Text>
              <Text className="mt-0.5 font-cairo text-[11px] text-textSecondary text-start">
                {doneTopics} / {totalTopics} مكتملة
              </Text>
            </View>
            <Pressable
              onPress={onClose}
              hitSlop={10}
              className="h-8 w-8 items-center justify-center rounded-full bg-card"
            >
              <X size={16} color={C.text} />
            </Pressable>
          </View>

          {/* List */}
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerClassName="px-3 py-4"
          >
            {sections.map((section) => (
              <View key={section.id} className="mb-5">
                <Text className="mb-2 px-3 font-cairo text-[10px] uppercase tracking-widest text-textSecondary text-start">
                  {section.title}
                </Text>

                {section.topics.map((topic) => {
                  const isActive = topic.id === activeId;
                  return (
                    <Pressable
                      key={topic.id}
                      onPress={() => {
                        onSelect(topic);
                        onClose();
                      }}
                      className={`mb-1 flex-row items-center rounded-md px-3 py-3 ${
                        isActive ? "bg-primary/5" : "active:bg-card"
                      }`}
                    >
                      {topic.completed ? (
                        <CheckCircle2 size={16} color={C.success} />
                      ) : (
                        <Circle
                          size={16}
                          color={isActive ? C.primary : C.muted}
                        />
                      )}
                      <Text
                        numberOfLines={2}
                        className={`ml-3 flex-1 text-body-md ${
                          isActive
                            ? "font-semibold text-primary"
                            : "text-textPrimary"
                        }`}
                      >
                        {topic.title}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            ))}
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
}
