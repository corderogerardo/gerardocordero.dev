import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Tabs } from "expo-router";
import { Pressable, Text, View } from "react-native";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { T } from "@/components/hud";

const TAB_META: Record<
  string,
  {
    label: string;
    icon: React.ComponentProps<typeof FontAwesome>["name"];
    title: string;
  }
> = {
  index: { label: "Status", icon: "circle-o-notch", title: "Status" },
  experience: { label: "Log", icon: "terminal", title: "Log" },
  education: { label: "Tree", icon: "sitemap", title: "Tree" },
  contact: { label: "Comms", icon: "paper-plane", title: "Comms" },
};

function HUDTabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      pointerEvents="box-none"
      style={{
        position: "absolute",
        left: 16,
        right: 16,
        bottom: Math.max(insets.bottom, 12) + 6,
      }}
    >
      <View
        style={{
          backgroundColor: T.ink,
          borderRadius: 9999,
          padding: 6,
          flexDirection: "row",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 14 },
          shadowOpacity: 0.18,
          shadowRadius: 30,
          elevation: 10,
        }}
      >
        {state.routes.map((route, index) => {
          const focused = state.index === index;
          const meta = TAB_META[route.name];
          if (!meta) return null;

          const onPress = () => {
            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });
            if (!focused && !event.defaultPrevented) {
              navigation.navigate(route.name, route.params);
            }
          };

          return (
            <Pressable
              key={route.key}
              onPress={onPress}
              accessibilityRole="button"
              accessibilityState={focused ? { selected: true } : {}}
              style={{
                flex: 1,
                borderRadius: 9999,
                paddingVertical: 9,
                paddingHorizontal: 4,
                backgroundColor: focused ? T.red : "transparent",
                alignItems: "center",
                justifyContent: "center",
                gap: 2,
              }}
            >
              <FontAwesome
                name={meta.icon}
                size={14}
                color={focused ? T.paper : "rgba(246,244,237,0.62)"}
              />
              <Text
                style={{
                  fontFamily: "JetBrainsMono_500Medium",
                  fontSize: 9,
                  letterSpacing: 0.9,
                  textTransform: "uppercase",
                  color: focused ? T.paper : "rgba(246,244,237,0.62)",
                }}
              >
                {meta.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <HUDTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        tabBarStyle: { backgroundColor: "transparent" },
      }}
    >
      <Tabs.Screen name="index" options={{ title: "Status" }} />
      <Tabs.Screen name="experience" options={{ title: "Log" }} />
      <Tabs.Screen name="education" options={{ title: "Tree" }} />
      <Tabs.Screen name="contact" options={{ title: "Comms" }} />
    </Tabs>
  );
}
