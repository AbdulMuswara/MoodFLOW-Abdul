import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import SignUpPage from "./page";

const pushMock = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
}));

jest.mock("../../lib/firebase", () => ({
  auth: {},
  db: {},
}));

jest.mock("firebase/auth", () => ({
  createUserWithEmailAndPassword: jest.fn(),
  GoogleAuthProvider: jest.fn(),
  sendEmailVerification: jest.fn(),
  signInWithPopup: jest.fn(),
}));

jest.mock("firebase/firestore", () => ({
  doc: jest.fn(() => "doc-ref"),
  setDoc: jest.fn(),
  serverTimestamp: jest.fn(() => "timestamp"),
}));

const {
  createUserWithEmailAndPassword,
  signInWithPopup,
  sendEmailVerification,
} = require("firebase/auth");

const { setDoc } = require("firebase/firestore");

describe("SignUpPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the signup form", () => {
    render(<SignUpPage />);

    expect(screen.getByText(/sign up for a new account/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/username/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/email address/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/^password$/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/confirm password/i)).toBeInTheDocument();
  });

  it("shows error when passwords do not match", async () => {
    render(<SignUpPage />);

    fireEvent.change(screen.getByPlaceholderText(/username/i), {
      target: { value: "testuser" },
    });

    fireEvent.change(screen.getByPlaceholderText(/email address/i), {
      target: { value: "test@test.com" },
    });

    fireEvent.change(screen.getByPlaceholderText(/^password$/i), {
      target: { value: "pass1" },
    });

    fireEvent.change(screen.getByPlaceholderText(/confirm password/i), {
      target: { value: "pass2" },
    });

    fireEvent.click(screen.getByRole("button", { name: /^sign up$/i }));

    expect(await screen.findByText(/passwords must match/i)).toBeInTheDocument();
  });

  it("creates account and redirects on success", async () => {
    createUserWithEmailAndPassword.mockResolvedValue({
      user: {
        uid: "123",
        email: "test@test.com",
      },
    });

    render(<SignUpPage />);

    fireEvent.change(screen.getByPlaceholderText(/username/i), {
      target: { value: "testuser" },
    });

    fireEvent.change(screen.getByPlaceholderText(/email address/i), {
      target: { value: "test@test.com" },
    });

    fireEvent.change(screen.getByPlaceholderText(/^password$/i), {
      target: { value: "password123" },
    });

    fireEvent.change(screen.getByPlaceholderText(/confirm password/i), {
      target: { value: "password123" },
    });

    fireEvent.click(screen.getByRole("button", { name: /^sign up$/i }));

    await waitFor(() => {
      expect(setDoc).toHaveBeenCalled();
      expect(sendEmailVerification).toHaveBeenCalled();
      expect(pushMock).toHaveBeenCalledWith(
        expect.stringContaining("/verify-email")
      );
    });
  });

  it("shows error when signup fails", async () => {
    createUserWithEmailAndPassword.mockRejectedValue({
      message: "Signup failed",
    });

    render(<SignUpPage />);

    fireEvent.change(screen.getByPlaceholderText(/username/i), {
      target: { value: "testuser" },
    });

    fireEvent.change(screen.getByPlaceholderText(/email address/i), {
      target: { value: "test@test.com" },
    });

    fireEvent.change(screen.getByPlaceholderText(/^password$/i), {
      target: { value: "password123" },
    });

    fireEvent.change(screen.getByPlaceholderText(/confirm password/i), {
      target: { value: "password123" },
    });

    fireEvent.click(screen.getByRole("button", { name: /^sign up$/i }));

    expect(await screen.findByText(/signup failed/i)).toBeInTheDocument();
  });

  it("signs up with Google", async () => {
    signInWithPopup.mockResolvedValue({
      user: {
        uid: "123",
        email: "test@test.com",
        emailVerified: true,
        displayName: "Test User",
      },
    });

    render(<SignUpPage />);

    fireEvent.click(
      screen.getByRole("button", { name: /sign up with google/i })
    );

    await waitFor(() => {
      expect(setDoc).toHaveBeenCalled();
      expect(pushMock).toHaveBeenCalledWith("/");
    });
  });

  it("shows error when Google signup fails", async () => {
    signInWithPopup.mockRejectedValue({
      message: "Google error",
    });

    render(<SignUpPage />);

    fireEvent.click(
      screen.getByRole("button", { name: /sign up with google/i })
    );

    expect(await screen.findByText(/google error/i)).toBeInTheDocument();
  });
});