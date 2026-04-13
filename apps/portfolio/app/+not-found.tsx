import { Link, Stack } from "expo-router";
import { View, Text } from "react-native";

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: "Oops!" }} />
      <View className="flex-1 items-center justify-center bg-prussian-blue p-6">
        <Text className="text-2xl font-bold text-honeydew">Page not found</Text>
        <Link href="/" className="mt-4">
          <Text className="text-base text-imperial-red underline">
            Go to home screen
          </Text>
        </Link>
      </View>
    </>
  );
}
