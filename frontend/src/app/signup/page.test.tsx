import { render, screen } from "@testing-library/react";
import SignUpPage from "./page";

jest.mock("../../lib/firebase", () => ({
  auth: {},
  db: {},
}));

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

jest.mock("firebase/auth", () => ({
  createUserWithEmailAndPassword: jest.fn(),
  GoogleAuthProvider: jest.fn(),
  sendEmailVerification: jest.fn(),
  signInWithPopup: jest.fn(),
}));

jest.mock("firebase/firestore", () => ({
  doc: jest.fn(),
  setDoc: jest.fn(),
  serverTimestamp: jest.fn(),
}));

describe("SignUpPage", () => {
  it("renders the signup form", () => {
    render(<SignUpPage />);

    expect(
      screen.getByRole("heading", { name: /sign up for a new account/i })
    ).toBeInTheDocument();

    expect(screen.getByPlaceholderText(/username/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/email address/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/^password$/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/confirm password/i)).toBeInTheDocument();

    expect(
      screen.getByRole("button", { name: /^sign up$/i })
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", { name: /sign up with google/i })
    ).toBeInTheDocument();
  });
});