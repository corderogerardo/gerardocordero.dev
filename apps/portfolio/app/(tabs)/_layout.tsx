import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Tabs } from "expo-router";
import { Platform } from "react-native";

function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>["name"];
  color: string;
}) {
  return <FontAwesome size={18} {...props} />;
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#E63946",
        tabBarInactiveTintColor: "#457B9D",
        tabBarStyle: {
          backgroundColor: "#F1FAEE",
          borderTopColor: "#1D3557",
          borderTopWidth: 2,
          height: Platform.OS === "ios" ? 86 : 66,
          paddingTop: 10,
          paddingBottom: Platform.OS === "ios" ? 24 : 8,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          letterSpacing: 0.5,
          marginTop: 4,
          fontFamily: "PlusJakartaSans_800ExtraBold",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => <TabBarIcon name="home" color={color} />,
        }}
      />
      <Tabs.Screen
        name="experience"
        options={{
          title: "Career",
          tabBarIcon: ({ color }) => (
            <TabBarIcon name="briefcase" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="education"
        options={{
          title: "Learn",
          tabBarIcon: ({ color }) => <TabBarIcon name="book" color={color} />,
        }}
      />
      <Tabs.Screen
        name="contact"
        options={{
          title: "Connect",
          tabBarIcon: ({ color }) => (
            <TabBarIcon name="paper-plane" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
