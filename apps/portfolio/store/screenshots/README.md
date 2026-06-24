# App Store screenshots

Generated screenshots for the App Store listing, captured from the iOS Simulator
at the two largest required sizes:

| Folder | Device | Resolution | App Store slot |
|---|---|---|---|
| `iphone-6.9/` | iPhone 17 Pro Max | 1320 × 2868 | iPhone 6.9" (covers 6.5" too) |
| `ipad-13/` | iPad Pro 13" (M5) | 2064 × 2752 | iPad 13" |

Each set has 6 shots in upload order: Status, Ask, Projects, Experience,
Education, Contact. (App Store uses the first 3 on install sheets.)

## Capture flows (Maestro)

- **`capture-dev.yml`** — the flow actually used. Drives a **dev-client build
  loaded from Metro** (deep link `portfolio://expo-development-client/?url=…`),
  taps the deep-link "Open" dialog, then walks every tab with `extendedWaitUntil`
  per screen (the Ask tab warms the on-device engine, so it needs the wait).
- **`capture.yml`** — simpler `launchApp` variant for a standalone/Release build.

## Regenerating

1. Boot a sim and install a build:
   - Dev-client: `npx expo run:ios` won't work locally — the **space in the repo
     path** (`No office location`) breaks the RN 0.85 prebuilt artifacts and
     several Expo build-phase scripts. Use an existing Debug build from
     DerivedData + Metro instead, loaded via the dev-client deep link.
   - (A cloud **EAS build** sidesteps the space issue entirely.)
2. Start Metro: `npx expo start --dev-client --port 8081`.
3. Clean status bar + disable the dev-menu floating button (otherwise it shows in
   shots), per sim:
   ```sh
   UDID=...; BID=dev.gerardocordero.portfolio
   xcrun simctl status_bar $UDID override --time "9:41" --batteryState charged \
     --batteryLevel 100 --wifiBars 3 --cellularBars 4 --dataNetwork wifi
   xcrun simctl spawn $UDID defaults write $BID EXDevMenuShowFloatingActionButton -bool false
   xcrun simctl spawn $UDID defaults write $BID EXDevMenuIsOnboardingFinished -bool true
   ```
4. Capture (full native resolution via Maestro's `takeScreenshot`):
   ```sh
   cd iphone-6.9   # or ipad-13
   JAVA_HOME=/opt/homebrew/opt/openjdk@17 maestro --device $UDID test ../capture-dev.yml
   ```

Upload to App Store Connect by dragging the PNGs into the iPhone / iPad slots
(App Store Connect's media manager only accepts manual uploads / its own API).
