import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Tabs } from "expo-router";
import { Platform } from "react-native";

function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>["name"];
  color: string;
}) {
  return <FontAwesome size={16} {...props} />;
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#E63946",
        tabBarInactiveTintColor: "#1D3557",
        tabBarStyle: {
          backgroundColor: "#F1FAEE",
          borderTopColor: "#1D3557",
          borderTopWidth: 2,
          height: Platform.OS === "ios" ? 84 : 64,
          paddingTop: 10,
          paddingBottom: Platform.OS === "ios" ? 24 : 8,
        },
        tabBarLabelStyle: {
          fontSize: 9,
          fontWeight: "700",
          letterSpacing: 2,
          textTransform: "uppercase",
          fontFamily: Platform.select({
            web: '"Major Mono Display", "Courier New", monospace',
            ios: "Courier",
            android: "monospace",
          }),
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Index",
          tabBarIcon: ({ color }) => <TabBarIcon name="circle-o" color={color} />,
        }}
      />
      <Tabs.Screen
        name="experience"
        options={{
          title: "Tenure",
          tabBarIcon: ({ color }) => <TabBarIcon name="briefcase" color={color} />,
        }}
      />
      <Tabs.Screen
        name="education"
        options={{
          title: "Studies",
          tabBarIcon: ({ color }) => <TabBarIcon name="book" color={color} />,
        }}
      />
      <Tabs.Screen
        name="contact"
        options={{
          title: "Dispatch",
          tabBarIcon: ({ color }) => <TabBarIcon name="paper-plane" color={color} />,
        }}
      />
    </Tabs>
  );
}
