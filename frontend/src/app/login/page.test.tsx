import { render, screen } from "@testing-library/react";
import SignInPage from "./page";

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
  GoogleAuthProvider: jest.fn(),
  sendEmailVerification: jest.fn(),
  signInWithEmailAndPassword: jest.fn(),
  signInWithPopup: jest.fn(),
  signOut: jest.fn(),
}));

jest.mock("firebase/firestore", () => ({
  doc: jest.fn(),
  setDoc: jest.fn(),
}));

describe("SignInPage", () => {
  it("renders the login form", () => {
    render(<SignInPage />);

    expect(
      screen.getByRole("heading", { name: /sign in to your account/i })
    ).toBeInTheDocument();

    expect(screen.getByPlaceholderText(/email address/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^sign in$/i })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /sign in with google/i })
    ).toBeInTheDocument();
  });
});