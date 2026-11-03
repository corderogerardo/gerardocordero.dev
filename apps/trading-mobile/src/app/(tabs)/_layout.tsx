import Ionicons from '@expo/vector-icons/Ionicons';
import { Tabs } from 'expo-router';
import { StyleSheet } from 'react-native';

import { colors } from '@/ui';

/**
 * Tab icons receive a platform colour value; our palette is always a hex string,
 * so narrow it and fall back rather than passing a native value to the icon.
 */
function tint(color: unknown): string {
  return typeof color === 'string' ? color : colors.textMuted;
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabLabel,
        sceneStyle: styles.scene,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Markets',
          tabBarButtonTestID: 'tab-markets',
          tabBarIcon: ({ color, size }) => (
            <Ionicons color={tint(color)} name="stats-chart" size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="portfolio"
        options={{
          title: 'Portfolio',
          tabBarButtonTestID: 'tab-portfolio',
          tabBarIcon: ({ color, size }) => <Ionicons color={tint(color)} name="wallet" size={size} />,
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          title: 'Orders',
          tabBarButtonTestID: 'tab-orders',
          tabBarIcon: ({ color, size }) => <Ionicons color={tint(color)} name="receipt" size={size} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarButtonTestID: 'tab-settings',
          tabBarIcon: ({ color, size }) => <Ionicons color={tint(color)} name="settings" size={size} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.surface,
    borderTopColor: colors.border,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  tabLabel: {
    fontSize: 11,
  },
  scene: {
    backgroundColor: colors.background,
  },
});
