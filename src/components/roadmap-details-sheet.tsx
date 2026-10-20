import { useTheme, type UseThemeReturn } from "@/hooks/use-theme";
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { useRouter } from "expo-router";
import { ArrowRight, Check, Lock, Play, X } from "lucide-react-native";
import { forwardRef, useCallback, useImperativeHandle, useRef } from "react";
import {
  Dimensions,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Svg, { Circle as SvgCircle } from "react-native-svg";

export type RoadmapDetailsSheetRef = {
  present: () => void;
  dismiss: () => void;
};

export type RoadmapDetailsSheetProps = {
  theme?: UseThemeReturn;
};

type NodeState = "completed" | "active" | "locked";

type ModuleNode = {
  id: number;
  title: string;
  subtitle: string;
  state: NodeState;
  progress: number;
};

const mockNodes: ModuleNode[] = [
  {
    id: 1,
    title: "Fundamentals",
    subtitle: "5/5 Mastered",
    state: "completed",
    progress: 1,
  },
  {
    id: 2,
    title: "Functions & Scope",
    subtitle: "6/6 Mastered",
    state: "completed",
    progress: 1,
  },
  {
    id: 3,
    title: "Arrays & Objects",
    subtitle: "2 of 5 done",
    state: "active",
    progress: 0.4,
  },
  {
    id: 4,
    title: "Async JavaScript",
    subtitle: "6 topics",
    state: "locked",
    progress: 0,
  },
  {
    id: 5,
    title: "Final Review",
    subtitle: "2 topics",
    state: "locked",
    progress: 0,
  },
];

// ── Duolingo-style layout constants ──────────────────────────────────
const NODE_SIZE = 70; // diameter of the circular button
const NODE_DEPTH = 8; // 3D bottom shadow thickness
const LABEL_HEIGHT = 38; // space for the label text below each circle
const ROW_HEIGHT = NODE_SIZE + NODE_DEPTH + LABEL_HEIGHT + 16; // total per node
const WAVE_AMPLITUDE = 55; // how far nodes sway left/right from center
const PAD_TOP = 24;
const PAD_BOTTOM = 20;

// ── Dynamic colors per state based on active theme ───────────────────
function getNodeColors(state: NodeState, theme: UseThemeReturn) {
  if (state === "completed" || state === "active") {
    return {
      face: theme.primary,
      depth: theme.primaryDark,
      icon: theme.onPrimary,
      ring: theme.isDark ? "#D8B4FE" : "#9D4EDD",
      track: theme.isDark ? "#3D2452" : "#E8D5F5",
      label: theme.textPrimary,
      subtitle: theme.textSecondary,
    };
  }

  // locked
  return {
    face: theme.neutralLight,
    depth: theme.border,
    icon: theme.disabledText,
    ring: theme.border,
    track: theme.neutralLight,
    label: theme.disabledText,
    subtitle: theme.disabledText,
  };
}

/**
 * Compute center positions for each node along a sine-wave path.
 * Returns the center (cx, cy) relative to the inner container.
 */
function computeNodeCenters(containerWidth: number) {
  const centerX = (containerWidth - PAD_TOP * 2) / 2; // horizontal midpoint
  const centers: { cx: number; cy: number }[] = [];

  mockNodes.forEach((_, i) => {
    const cy = PAD_TOP + NODE_SIZE / 2 + i * ROW_HEIGHT;
    // Sine-wave offset: 0 → right, 1 → left, 2 → right, ...
    const angle = (i * Math.PI) / 1; // flip every node
    const cx = centerX + Math.sin(angle + Math.PI / 2) * WAVE_AMPLITUDE;
    centers.push({ cx, cy });
  });

  const totalHeight = PAD_TOP + mockNodes.length * ROW_HEIGHT + PAD_BOTTOM;
  return { centers, totalHeight };
}

/**
 * Dotted trail between two node centers — skips the area inside the circles.
 */
function trailDots(
  from: { cx: number; cy: number },
  to: { cx: number; cy: number },
  color: string,
) {
  const dots: { cx: number; cy: number; r: number; fill: string }[] = [];
  const count = 6;
  for (let i = 0; i <= count; i++) {
    const t = i / count;
    // Skip dots that land inside either node circle
    if (t < 0.15 || t > 0.85) continue;
    const cx = from.cx + (to.cx - from.cx) * t;
    const cy = from.cy + (to.cy - from.cy) * t;
    const r = t > 0.3 && t < 0.7 ? 4 : 3;
    dots.push({ cx: cx + PAD_TOP, cy: cy + PAD_TOP, r, fill: color });
  }
  return dots;
}

export const RoadmapDetailsSheet = forwardRef<
  RoadmapDetailsSheetRef,
  RoadmapDetailsSheetProps
>((props, ref) => {
  const hookTheme = useTheme();
  const theme = props.theme ?? hookTheme;
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);

  useImperativeHandle(ref, () => ({
    present: () => bottomSheetModalRef.current?.present(),
    dismiss: () => bottomSheetModalRef.current?.dismiss(),
  }));

  const renderBackdrop = useCallback(
    (bdProps: any) => (
      <BottomSheetBackdrop
        {...bdProps}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        opacity={0.6}
      />
    ),
    [],
  );

  const screenWidth = Dimensions.get("window").width;
  const containerWidth = screenWidth - 40;
  const { centers, totalHeight } = computeNodeCenters(containerWidth);

  // Build SVG trail dots
  const allDots: { cx: number; cy: number; r: number; fill: string }[] = [];
  for (let i = 0; i < mockNodes.length - 1; i++) {
    const dotColor =
      mockNodes[i].state === "completed" && mockNodes[i + 1].state !== "locked"
        ? theme.isDark
          ? `${theme.primary}88`
          : `${theme.primaryDark}88`
        : theme.isDark
          ? `${theme.border}88`
          : `${theme.border}CC`;
    allDots.push(...trailDots(centers[i], centers[i + 1], dotColor));
  }

  return (
    <BottomSheetModal
      ref={bottomSheetModalRef}
      snapPoints={["90%"]}
      backdropComponent={renderBackdrop}
      backgroundStyle={{ backgroundColor: theme.card }}
      handleIndicatorStyle={{
        backgroundColor: theme.outlineVariant,
        width: 40,
      }}
    >
      <BottomSheetView style={styles.contentContainer}>
        {/* Header */}
        <View className="px-5 pt-2 pb-4">
          <View className="flex-row justify-between items-start mb-2">
            <Text className="text-[10px] font-mono tracking-widest uppercase font-bold mt-2">
              <Text className="text-primary">LEARNING PATH</Text>
              <Text className="text-textSecondary"> • 5 MODULES</Text>
            </Text>
            <Pressable
              onPress={() => bottomSheetModalRef.current?.dismiss()}
              className="w-8 h-8 bg-neutralLight border border-border/50 rounded-full items-center justify-center active:opacity-70"
            >
              <X size={16} color={theme.textPrimary} />
            </Pressable>
          </View>

          <Text className="text-textPrimary text-2xl font-bold mb-4">
            JavaScript Fundamentals
          </Text>

          <View className="flex-row justify-between items-center mb-2">
            <Text className="text-textSecondary text-xs font-mono">
              18 / 25 topics completed
            </Text>
            <Text className="text-primary text-xs font-mono font-bold">
              72%
            </Text>
          </View>

          <View className="w-full h-1.5 bg-neutralLight rounded-full overflow-hidden">
            <View className="h-full bg-primary rounded-full w-[72%]" />
          </View>
        </View>

        {/* ── Duolingo-Style Path ── */}
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingBottom: 120 }}
        >
          <View
            className="mx-5 rounded-2xl overflow-hidden bg-background border border-border/60"
            style={{ height: totalHeight + PAD_TOP * 2 }}
          >
            {/* SVG connector dots */}
            <Svg
              width={containerWidth}
              height={totalHeight + PAD_TOP * 2}
              style={StyleSheet.absoluteFill}
            >
              {allDots.map((dot, i) => (
                <SvgCircle
                  key={i}
                  cx={dot.cx}
                  cy={dot.cy}
                  r={dot.r}
                  fill={dot.fill}
                />
              ))}
            </Svg>

            {/* Node buttons */}
            {mockNodes.map((node, index) => {
              const c = centers[index];
              return (
                <DuoNode
                  key={node.id}
                  node={node}
                  cx={c.cx + PAD_TOP}
                  cy={c.cy + PAD_TOP}
                  theme={theme}
                />
              );
            })}
          </View>
        </ScrollView>

        {/* Footer */}
        <View className="absolute bottom-0 w-full px-5 pb-8 pt-4 bg-card border-t border-border">
          <Pressable className="w-full bg-primary rounded-xl py-4 flex-row justify-center items-center active:scale-95 shadow-sm">
            <Text className="text-on-primary font-bold text-[15px] mr-2">
              Continue: Destructuring & Object Spread
            </Text>
            <ArrowRight size={18} color={theme.onPrimary} />
          </Pressable>
          <Text className="text-textSecondary text-center text-xs font-mono mt-4">
            Press ESC or swipe down to dismiss
          </Text>
        </View>
      </BottomSheetView>
    </BottomSheetModal>
  );
});

// ── Duolingo-style 3D circular node ──────────────────────────────────
function DuoNode({
  node,
  cx,
  cy,
  theme,
}: {
  node: ModuleNode;
  cx: number;
  cy: number;
  theme: UseThemeReturn;
}) {
  const router = useRouter();
  const colors = getNodeColors(node.state, theme);
  const ringSize = NODE_SIZE + 16;
  const ringCenter = ringSize / 2;
  const ringRadius = (ringSize - 8) / 2;
  const circumference = 2 * Math.PI * ringRadius;
  const progress = Math.max(0, Math.min(1, node.progress));

  const icon = (() => {
    switch (node.state) {
      case "completed":
        return <Check size={27} color={colors.icon} strokeWidth={3} />;
      case "active":
        return <Play size={27} color={colors.icon} fill={colors.icon} />;
      case "locked":
        return <Lock size={23} color={colors.icon} />;
    }
  })();

  return (
    <Pressable
      onPress={() => {
        console.log(`Pressed node: ${node.title}`);

        router.push({
          pathname: "/[topic]" as any,
          params: {
            topic: "altimg",
            title: "altimg",
          },
        });
      }}

      style={{
        position: "absolute",
        left: cx - NODE_SIZE / 2,
        top: cy - NODE_SIZE / 2,
        width: NODE_SIZE,
        alignItems: "center",
      }}
    >
      {/* Circular progress border */}
      <Svg
        width={ringSize}
        height={ringSize}
        style={{
          position: "absolute",
          top: -8,
          left: -8,
        }}
      >
        {/* Background track */}
        <SvgCircle
          cx={ringCenter}
          cy={ringCenter}
          r={ringRadius}
          fill="none"
          stroke={colors.track}
          strokeWidth={4}
        />

        {/* Progress arc */}
        {progress > 0 && (
          <SvgCircle
            cx={ringCenter}
            cy={ringCenter}
            r={ringRadius}
            fill="none"
            stroke={colors.ring}
            strokeWidth={4}
            strokeLinecap="round"
            strokeDasharray={`${circumference} ${circumference}`}
            strokeDashoffset={circumference * (1 - progress)}
            rotation={-90}
            origin={`${ringCenter}, ${ringCenter}`}
          />
        )}
      </Svg>

      {/* 3D bottom layer */}
      <View
        style={{
          position: "absolute",
          top: 5,
          width: NODE_SIZE,
          height: NODE_SIZE,
          borderRadius: NODE_SIZE / 2,
          backgroundColor: colors.depth,
        }}
      />

      {/* Main node */}
      <Pressable
        disabled={node.state === "locked"}
        style={{
          width: NODE_SIZE,
          height: NODE_SIZE,
          borderRadius: NODE_SIZE / 2,
          backgroundColor: colors.face,
          alignItems: "center",
          justifyContent: "center",
          borderWidth: node.state === "active" ? 2 : 0,
          borderColor: theme.isDark ? theme.border : theme.primaryDark,
        }}
      >
        {icon}
      </Pressable>

      {/* Completion badge */}
      {node.state === "completed" && (
        <View
          style={{
            position: "absolute",
            top: -5,
            right: -5,
            width: 23,
            height: 23,
            borderRadius: 12,
            backgroundColor: theme.success,
            alignItems: "center",
            justifyContent: "center",
            borderWidth: 2,
            borderColor: theme.card,
          }}
        >
          <Check size={13} color="#FFFFFF" strokeWidth={3} />
        </View>
      )}

      {/* Module title */}
      <Text
        numberOfLines={1}
        style={{
          color: colors.label,
          fontSize: 11,
          fontWeight: "700",
          textAlign: "center",
          marginTop: NODE_DEPTH + 6,
          width: NODE_SIZE + 40,
        }}
      >
        {node.title}
      </Text>

      {/* Module subtitle */}
      <Text
        numberOfLines={1}
        style={{
          color: colors.subtitle,
          fontSize: 10,
          textAlign: "center",
          marginTop: 2,
          width: NODE_SIZE + 40,
        }}
      >
        {node.subtitle}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  contentContainer: {
    flex: 1,
  },
});
