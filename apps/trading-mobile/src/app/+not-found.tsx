import { router } from 'expo-router';

import { EmptyState, Screen, ScreenHeader } from '@/ui';

export default function NotFoundScreen() {
  return (
    <Screen edges={['top', 'bottom']} testID="screen-not-found">
      <ScreenHeader title="Not found" />
      <EmptyState
        actionLabel="Go to markets"
        message="The screen you asked for does not exist in this build."
        onAction={() => router.replace('/(tabs)')}
        title="Nothing here"
      />
    </Screen>
  );
}
