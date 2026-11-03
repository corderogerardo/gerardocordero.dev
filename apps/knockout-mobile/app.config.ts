import type { ConfigContext, ExpoConfig } from "expo/config";

/**
 * Dynamic Expo config.
 *
 * Two rules this file follows:
 *
 * 1. **Permissions are declared explicitly, not by plugin.** `ios.infoPlist` and
 *    `android.permissions` are the single, greppable source of truth, and
 *    `scripts/verify-native-config.mjs` asserts they survive `expo prebuild`.
 *    The permission plugins would work too; they just hide the strings from a
 *    reviewer and from the verification script.
 * 2. **`runtimeVersion` is derived from the app version.** An OTA update can only
 *    ship JS and assets; tying the runtime to the marketing version is what stops
 *    a JS bundle landing on a native binary that does not have the module it needs.
 */
export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: "Knockout",
  slug: "knockout",
  version: "0.1.0",
  scheme: "knockout",
  orientation: "portrait",
  userInterfaceStyle: "automatic",
  // No `newArchEnabled` key: the New Architecture is the only architecture in
  // modern Expo SDKs and the flag was removed from the config type. Leaving it
  // in is a type error, which is exactly how it should fail.
  runtimeVersion: { policy: "appVersion" },
  updates: {
    // `eas init` fills `updates.url` and `extra.eas.projectId`. Until then the
    // app behaves exactly like a build without OTA, which is what we want locally.
    enabled: true,
    checkAutomatically: "ON_LOAD",
    fallbackToCacheTimeout: 0,
  },
  ios: {
    supportsTablet: false,
    bundleIdentifier: "dev.gerardocordero.knockout",
    infoPlist: {
      // Background sync and geofencing. Without these the OS silently refuses to
      // wake the app, which looks exactly like "the sync is broken".
      UIBackgroundModes: ["location", "fetch", "processing"],
      NSLocationWhenInUseUsageDescription:
        "Knockout shows which territory you are standing in and records where each knock happened.",
      NSLocationAlwaysAndWhenInUseUsageDescription:
        "Knockout detects when you enter your assigned territory so the map and the knock list are ready before you knock.",
      NSCameraUsageDescription:
        "Knockout uses the camera to photograph the property and to scan the QR code printed on a door hanger.",
      NSPhotoLibraryUsageDescription:
        "Knockout can attach a photo you already took of the property to a lead.",
      NSUserNotificationsUsageDescription:
        "Knockout notifies you when a lead is assigned to you and when your shift is still open.",
    },
  },
  android: {
    package: "dev.gerardocordero.knockout",
    permissions: [
      "ACCESS_COARSE_LOCATION",
      "ACCESS_FINE_LOCATION",
      "ACCESS_BACKGROUND_LOCATION",
      "CAMERA",
      "POST_NOTIFICATIONS",
      "RECEIVE_BOOT_COMPLETED",
      "WAKE_LOCK",
    ],
  },
  plugins: ["expo-router"],
  experiments: {
    typedRoutes: true,
  },
  extra: {
    // Non-secret build metadata, surfaced in Settings so a screenshot from a
    // field device identifies exactly what is running.
    releaseChannel: process.env.EAS_BUILD_PROFILE ?? "local",
  },
});
