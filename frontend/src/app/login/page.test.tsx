import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import SignInPage from "./page";

const pushMock = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
}));

jest.mock("../../lib/firebase", () => ({
  auth: {},
  db: {},
}));

jest.mock("firebase/auth", () => ({
  GoogleAuthProvider: jest.fn(),
  sendEmailVerification: jest.fn(),
  signInWithEmailAndPassword: jest.fn(),
  signInWithPopup: jest.fn(),
  signOut: jest.fn(),
}));

jest.mock("firebase/firestore", () => ({
  doc: jest.fn(() => "doc-ref"),
  setDoc: jest.fn(),
}));

const {
  signInWithEmailAndPassword,
  signInWithPopup,
  sendEmailVerification,
  signOut,
} = require("firebase/auth");

const { setDoc } = require("firebase/firestore");

describe("SignInPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders login form", () => {
    render(<SignInPage />);

    expect(screen.getByText(/sign in to your account/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/email address/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/password/i)).toBeInTheDocument();
  });

  it("logs in successfully when email is verified", async () => {
    signInWithEmailAndPassword.mockResolvedValue({
      user: {
        uid: "123",
        email: "test@test.com",
        emailVerified: true,
        reload: jest.fn(),
      },
    });

    render(<SignInPage />);

    fireEvent.change(screen.getByPlaceholderText(/email address/i), {
      target: { value: "test@test.com" },
    });

    fireEvent.change(screen.getByPlaceholderText(/password/i), {
      target: { value: "password123" },
    });

    fireEvent.click(screen.getByRole("button", { name: /^sign in$/i }));

    await waitFor(() => {
      expect(setDoc).toHaveBeenCalled();
      expect(pushMock).toHaveBeenCalledWith("/");
    });
  });

  it("redirects to verify-email if user is not verified", async () => {
    signInWithEmailAndPassword.mockResolvedValue({
      user: {
        uid: "123",
        email: "test@test.com",
        emailVerified: false,
        reload: jest.fn(),
      },
    });

    render(<SignInPage />);

    fireEvent.change(screen.getByPlaceholderText(/email address/i), {
    target: { value: "test@test.com" },
    });

    fireEvent.change(screen.getByPlaceholderText(/password/i), {
    target: { value: "password123" },
    });

    fireEvent.click(screen.getByRole("button", { name: /^sign in$/i }));

    await waitFor(() => {
      expect(sendEmailVerification).toHaveBeenCalled();
      expect(signOut).toHaveBeenCalled();
      expect(pushMock).toHaveBeenCalledWith(
        expect.stringContaining("/verify-email")
      );
    });
  });

  it("shows error for invalid credentials", async () => {
    signInWithEmailAndPassword.mockRejectedValue({
      code: "auth/invalid-credential",
    });

    render(<SignInPage />);

    fireEvent.change(screen.getByPlaceholderText(/email address/i), {
    target: { value: "test@test.com" },
    });

    fireEvent.change(screen.getByPlaceholderText(/password/i), {
    target: { value: "password123" },
    });

    fireEvent.click(screen.getByRole("button", { name: /^sign in$/i }));

    expect(
      await screen.findByText(/invalid email or password/i)
    ).toBeInTheDocument();
  });

  it("shows generic error for unknown error", async () => {
    signInWithEmailAndPassword.mockRejectedValue({
      code: "something-else",
    });

    render(<SignInPage />);

    fireEvent.change(screen.getByPlaceholderText(/email address/i), {
    target: { value: "test@test.com" },
    });

    fireEvent.change(screen.getByPlaceholderText(/password/i), {
    target: { value: "password123" },
    });

    fireEvent.click(screen.getByRole("button", { name: /^sign in$/i }));

    expect(
      await screen.findByText(/something went wrong/i)
    ).toBeInTheDocument();
  });

  it("logs in with Google successfully", async () => {
    signInWithPopup.mockResolvedValue({
      user: {
        uid: "123",
        email: "test@test.com",
        emailVerified: true,
      },
    });

    render(<SignInPage />);

    fireEvent.click(
      screen.getByRole("button", { name: /sign in with google/i })
    );

    await waitFor(() => {
      expect(setDoc).toHaveBeenCalled();
      expect(pushMock).toHaveBeenCalledWith("/");
    });
  });

  it("shows error if Google sign-in fails", async () => {
    signInWithPopup.mockRejectedValue(new Error("fail"));

    render(<SignInPage />);

    fireEvent.click(
      screen.getByRole("button", { name: /sign in with google/i })
    );

    expect(
      await screen.findByText(/google sign-in failed/i)
    ).toBeInTheDocument();
  });
});