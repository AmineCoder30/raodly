import { View } from "react-native";

function SkeletonLine({
  className,
}: {
  className: string;
}) {
  return <View className={`rounded-md bg-border/70 animate-pulse ${className}`} />;
}

export default function LessonSkeleton() {
  return (
    <View className="mt-5">
      <SkeletonLine className="h-8 w-4/5 self-end" />

      <View className="mt-4 overflow-hidden rounded-xl border border-border/60 bg-card">
        <View className="flex-row">
          <View className="w-1 bg-primary/50" />
          <View className="flex-1 gap-3 p-4">
            <SkeletonLine className="h-4 w-full" />
            <SkeletonLine className="h-4 w-11/12" />
            <SkeletonLine className="h-4 w-3/5" />
          </View>
        </View>
      </View>

      <View className="mt-6 overflow-hidden rounded-xl border border-border/60 bg-card">
        <View className="flex-row">
          <View className="w-1 bg-primary/50" />
          <View className="flex-1 gap-4 p-4">
            <View className="flex-row items-center gap-2">
              <SkeletonLine className="h-5 w-5 rounded-full" />
              <SkeletonLine className="h-4 w-32" />
            </View>
            <View className="gap-3">
              <View className="flex-row items-center gap-2.5">
                <SkeletonLine className="h-2 w-2 rounded-full" />
                <SkeletonLine className="h-4 flex-1" />
              </View>
              <View className="flex-row items-center gap-2.5">
                <SkeletonLine className="h-2 w-2 rounded-full" />
                <SkeletonLine className="h-4 w-11/12" />
              </View>
              <View className="flex-row items-center gap-2.5">
                <SkeletonLine className="h-2 w-2 rounded-full" />
                <SkeletonLine className="h-4 w-4/5" />
              </View>
            </View>
          </View>
        </View>
      </View>

      <View className="mt-6 overflow-hidden rounded-xl border border-border/60 bg-card">
        <View className="flex-row items-center justify-between border-b border-border/60 bg-background px-4 py-3">
          <SkeletonLine className="h-4 w-24" />
          <SkeletonLine className="h-5 w-16 rounded-md" />
        </View>
        <View className="gap-3 p-4">
          <SkeletonLine className="h-4 w-full" />
          <SkeletonLine className="h-4 w-11/12" />
          <SkeletonLine className="h-4 w-2/3" />
          <SkeletonLine className="mt-2 h-24 w-full rounded-lg" />
        </View>
      </View>

      <View className="mt-6 overflow-hidden rounded-xl border border-border/60 bg-card p-4">
        <SkeletonLine className="h-5 w-2/3 self-end" />
        <View className="mt-4 gap-3">
          <SkeletonLine className="h-12 w-full rounded-lg" />
          <SkeletonLine className="h-12 w-full rounded-lg" />
          <SkeletonLine className="h-12 w-full rounded-lg" />
        </View>
      </View>
    </View>
  );
}
