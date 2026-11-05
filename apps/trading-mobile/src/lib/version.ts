import Constants from 'expo-constants';

/** Marketing version from `app.json`, injected by app config at build time. */
export function versionLabel(): string {
  const version = Constants.expoConfig?.version;
  return version ? `v${version}` : 'v0.0.0';
}
