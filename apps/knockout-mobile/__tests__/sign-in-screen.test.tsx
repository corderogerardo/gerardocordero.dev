import { fireEvent, render, screen } from "@testing-library/react-native";

const mockReplace = jest.fn();
const mockSignIn = jest.fn(async () => undefined);
const mockClearError = jest.fn();

const mockSessionState = {
  status: "signed_out" as const,
  profile: null,
  error: null as string | null,
  busy: false,
  signIn: mockSignIn,
  signOut: jest.fn(),
  bootstrap: jest.fn(),
  clearError: mockClearError,
};

jest.mock("expo-router", () => ({
  useRouter: () => ({ replace: mockReplace, push: jest.fn(), back: jest.fn() }),
}));

jest.mock("../src/data/session", () => {
  const hook = (selector: (state: typeof mockSessionState) => unknown) => selector(mockSessionState);
  return { useSessionStore: Object.assign(hook, { getState: () => mockSessionState }) };
});

// eslint-disable-next-line import/first -- the mock must be registered first
import SignInScreen from "../app/(auth)/sign-in";

describe("sign in screen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSessionState.error = null;
    mockSessionState.busy = false;
  });

  it("does not submit until both fields have content", async () => {
    await render(<SignInScreen />);

    await fireEvent.press(screen.getByTestId("sign-in-submit"));
    expect(mockSignIn).not.toHaveBeenCalled();

    await fireEvent.changeText(screen.getByTestId("sign-in-email"), "marcus@northwind.test");
    await fireEvent.press(screen.getByTestId("sign-in-submit"));
    expect(mockSignIn).not.toHaveBeenCalled();

    await fireEvent.changeText(screen.getByTestId("sign-in-password"), "knockout123");
    await fireEvent.press(screen.getByTestId("sign-in-submit"));
    expect(mockSignIn).toHaveBeenCalledWith("marcus@northwind.test", "knockout123");
  });

  it("trims the email before submitting", async () => {
    await render(<SignInScreen />);

    await fireEvent.changeText(screen.getByTestId("sign-in-email"), "  marcus@northwind.test  ");
    await fireEvent.changeText(screen.getByTestId("sign-in-password"), "knockout123");
    await fireEvent.press(screen.getByTestId("sign-in-submit"));

    expect(mockSignIn).toHaveBeenCalledWith("marcus@northwind.test", "knockout123");
  });

  it("shows the store's error as an alert", async () => {
    mockSessionState.error = "That email and password do not match.";

    await render(<SignInScreen />);

    expect(screen.getByTestId("sign-in-error")).toHaveTextContent(
      "That email and password do not match.",
    );
  });

  it("clears a stale error as soon as the user edits a field", async () => {
    mockSessionState.error = "That email and password do not match.";
    await render(<SignInScreen />);

    await fireEvent.changeText(screen.getByTestId("sign-in-email"), "marcus@northwind.test");

    expect(mockClearError).toHaveBeenCalled();
  });

  it("does not call the store again while a sign-in is in flight", async () => {
    mockSessionState.busy = true;
    await render(<SignInScreen />);

    await fireEvent.changeText(screen.getByTestId("sign-in-email"), "marcus@northwind.test");
    await fireEvent.changeText(screen.getByTestId("sign-in-password"), "knockout123");
    await fireEvent.press(screen.getByTestId("sign-in-submit"));

    expect(mockSignIn).not.toHaveBeenCalled();
  });
});
