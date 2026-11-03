import { Tabs } from "expo-router";

import { colors, font, weight } from "../../src/ui/tokens";

/**
 * Five tabs, in the order a rep uses them during a shift:
 * Shift → Map → Leads → Board → Settings.
 *
 * `tabBarButtonTestID` is the shared selector with Maestro (`tab-shift`, …).
 * Every tab screen renders a root with `screen-<route>` (see `src/ui/Screen.tsx`).
 */
export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.brand,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
        },
        tabBarLabelStyle: { fontSize: font.caption, fontWeight: weight.medium },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: "Shift", tabBarButtonTestID: "tab-shift" }}
      />
      <Tabs.Screen name="map" options={{ title: "Map", tabBarButtonTestID: "tab-map" }} />
      <Tabs.Screen name="leads" options={{ title: "Leads", tabBarButtonTestID: "tab-leads" }} />
      <Tabs.Screen name="board" options={{ title: "Board", tabBarButtonTestID: "tab-board" }} />
      <Tabs.Screen
        name="settings"
        options={{ title: "Settings", tabBarButtonTestID: "tab-settings" }}
      />
    </Tabs>
  );
}
