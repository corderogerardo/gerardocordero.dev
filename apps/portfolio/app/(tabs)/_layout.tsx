import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Tabs } from "expo-router";

function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>["name"];
  color: string;
}) {
  return <FontAwesome size={24} style={{ marginBottom: -3 }} {...props} />;
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#E63946",
        tabBarInactiveTintColor: "#457B9D",
        tabBarStyle: {
          backgroundColor: "#1D3557",
          borderTopColor: "#457B9D",
        },
        headerStyle: { backgroundColor: "#1D3557" },
        headerTintColor: "#F1FAEE",
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
          title: "Experience",
          tabBarIcon: ({ color }) => <TabBarIcon name="briefcase" color={color} />,
        }}
      />
      <Tabs.Screen
        name="education"
        options={{
          title: "Education",
          tabBarIcon: ({ color }) => (
            <TabBarIcon name="graduation-cap" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="contact"
        options={{
          title: "Contact",
          tabBarIcon: ({ color }) => (
            <TabBarIcon name="address-card" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
