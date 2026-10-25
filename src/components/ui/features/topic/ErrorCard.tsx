import { View, Text, Pressable } from 'react-native'
import {TriangleAlert} from 'lucide-react-native'
import { useRouter } from 'expo-router';

type errorCardType = {
  error: string;
  onRetry: () => void;

};





const ErrorCard = ({ error, onRetry }: errorCardType) => {
  const router = useRouter();
  return (
    <View className="mt-6 min-h-[440px] flex-col flex-1 justify-center items-center gap-5  ">
      <View className="h-20 w-20 rounded-full bg-warning/10 items-center justify-center">
        <TriangleAlert size={40} color={"#FF6B6B"} />
      </View>
      <Text className="text-body-lg max-w-72 text-textPrimary font-cairo text-center">
        {error}
      </Text>
      <View className="mt-4 w-full flex-row justify-center items-center gap-3">
        <Pressable
          onPress={() => void onRetry()}
          className="rounded-md bg-primary px-4 py-2"
        >
          <Text className="font-cairo-semibold font-semibold text-onPrimary text-start">
            إعادة المحاولة
          </Text>
        </Pressable>
        <Pressable
          onPress={() => router.push("/settings")}
          className="rounded-md border border-border px-4 py-2"
        >
          <Text className="text-textPrimary font-cairo text-start">
            الإعدادات
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

export default ErrorCard