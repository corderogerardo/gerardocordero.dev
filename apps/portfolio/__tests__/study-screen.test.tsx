// Smoke test for the interactive study flow: the screen boots, shows a card, and a
// reveal → grade cycle advances the session. This is the user-facing functionality
// that distinguishes the app from a static portfolio.
import { fireEvent, render, screen } from "@testing-library/react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

import StudyScreen from "../app/(tabs)/study";

const metrics = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 47, left: 0, right: 0, bottom: 34 },
};

function renderScreen() {
  return render(
    <SafeAreaProvider initialMetrics={metrics}>
      <StudyScreen />
    </SafeAreaProvider>,
  );
}

describe("<StudyScreen />", () => {
  it("renders the study screen root", async () => {
    await renderScreen();
    expect(await screen.findByTestId("screen-study")).toBeOnTheScreen();
  });

  it("shows a flashcard once progress hydrates", async () => {
    await renderScreen();
    expect(await screen.findByTestId("flashcard")).toBeOnTheScreen();
    expect(screen.getByText("TAP TO REVEAL")).toBeOnTheScreen();
  });

  it("reveals the answer and exposes grade controls on tap", async () => {
    await renderScreen();
    const card = await screen.findByTestId("flashcard");
    await fireEvent.press(card);

    expect(await screen.findByTestId("grade-good")).toBeOnTheScreen();
    // The reveal hint is gone once the answer is shown.
    expect(screen.queryByText("TAP TO REVEAL")).toBeNull();
  });

  it("advances to the next card after grading", async () => {
    await renderScreen();
    await fireEvent.press(await screen.findByTestId("flashcard"));
    await fireEvent.press(await screen.findByTestId("grade-good"));

    // Back to an unrevealed card, with the progress counter moved on.
    expect(await screen.findByText("TAP TO REVEAL")).toBeOnTheScreen();
    expect(await screen.findByText(/^2 \//)).toBeOnTheScreen();
  });
});
