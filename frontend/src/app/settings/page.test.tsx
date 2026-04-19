import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SettingsPage from "./page";
import { auth } from "@/lib/firebase";

const replaceMock = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    replace: replaceMock,
    push: jest.fn(),
  }),
}));

jest.mock("@/components/Navbar", () => ({
  __esModule: true,
  default: () => <nav data-testid="navbar" />,
}));

jest.mock("@/lib/firebase", () => ({
  auth: {},
}));

const reauthenticateWithCredential = jest.fn();
const reauthenticateWithPopup = jest.fn();
const updatePassword = jest.fn();
const linkWithCredential = jest.fn();

let mockUser: {
  uid: string;
  email: string | null;
  providerData: { providerId: string; uid: string; displayName: string | null; email: string | null; phoneNumber: string | null; photoURL: string | null }[];
  reload: jest.Mock;
} | null = null;

jest.mock("firebase/auth", () => ({
  onAuthStateChanged: jest.fn((_auth: unknown, callback: (u: typeof mockUser) => void) => {
    callback(mockUser);
    return jest.fn();
  }),
  EmailAuthProvider: {
    credential: jest.fn((email: string, password: string) => ({ type: "email", email, password })),
  },
  GoogleAuthProvider: jest.fn(function GoogleAuthProvider() {
    return { providerId: "google.com" };
  }),
  linkWithCredential: (...args: unknown[]) => linkWithCredential(...args),
  reauthenticateWithCredential: (...args: unknown[]) => reauthenticateWithCredential(...args),
  reauthenticateWithPopup: (...args: unknown[]) => reauthenticateWithPopup(...args),
  updatePassword: (...args: unknown[]) => updatePassword(...args),
}));

describe("SettingsPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (auth as unknown as { currentUser: typeof mockUser | null }).currentUser = null;

    mockUser = {
      uid: "u1",
      email: "sam@example.com",
      providerData: [
        {
          providerId: "password",
          uid: "u1",
          displayName: null,
          email: "sam@example.com",
          phoneNumber: null,
          photoURL: null,
        },
      ],
      reload: jest.fn().mockResolvedValue(undefined),
    };

    (auth as unknown as { currentUser: typeof mockUser | null }).currentUser = mockUser;

    reauthenticateWithCredential.mockResolvedValue(undefined);
    updatePassword.mockResolvedValue(undefined);
    reauthenticateWithPopup.mockResolvedValue(undefined);
    linkWithCredential.mockResolvedValue(undefined);
  });

  it("redirects to login when there is no signed-in user", async () => {
    mockUser = null;
    (auth as unknown as { currentUser: typeof mockUser | null }).currentUser = null;

    render(<SettingsPage />);

    await waitFor(() => {
      expect(replaceMock).toHaveBeenCalledWith("/login");
    });
  });

  it("renders settings heading and read-only email for a signed-in user", async () => {
    render(<SettingsPage />);

    expect(await screen.findByRole("heading", { name: /^settings$/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/your email address/i)).toHaveValue("sam@example.com");
  });

  it("shows change password when the account has a password provider", async () => {
    render(<SettingsPage />);

    expect(await screen.findByRole("heading", { name: /change password/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/^current password$/i)).toBeInTheDocument();
  });

  it("validates mismatched new passwords before calling Firebase", async () => {
    const user = userEvent.setup();
    render(<SettingsPage />);

    await screen.findByLabelText(/^current password$/i);

    await user.type(screen.getByLabelText(/^current password$/i), "oldpass1");
    await user.type(screen.getByLabelText(/^new password$/i), "newpass1");
    await user.type(screen.getByLabelText(/^confirm new password$/i), "newpass2");

    await user.click(screen.getByRole("button", { name: /update password/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(/do not match/i);
    expect(reauthenticateWithCredential).not.toHaveBeenCalled();
  });

  it("validates short new password before calling Firebase", async () => {
    const user = userEvent.setup();
    render(<SettingsPage />);

    await screen.findByLabelText(/^current password$/i);

    await user.type(screen.getByLabelText(/^current password$/i), "oldpass1");
    await user.type(screen.getByLabelText(/^new password$/i), "short");
    await user.type(screen.getByLabelText(/^confirm new password$/i), "short");

    await user.click(screen.getByRole("button", { name: /update password/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(/at least 6 characters/i);
    expect(reauthenticateWithCredential).not.toHaveBeenCalled();
  });

  it("updates password after reauthentication succeeds", async () => {
    const user = userEvent.setup();
    render(<SettingsPage />);

    await screen.findByLabelText(/^current password$/i);

    await user.type(screen.getByLabelText(/^current password$/i), "current123");
    await user.type(screen.getByLabelText(/^new password$/i), "newpass123");
    await user.type(screen.getByLabelText(/^confirm new password$/i), "newpass123");

    await user.click(screen.getByRole("button", { name: /update password/i }));

    await waitFor(() => {
      expect(reauthenticateWithCredential).toHaveBeenCalled();
    });
    expect(updatePassword).toHaveBeenCalledWith(mockUser, "newpass123");
    expect(mockUser?.reload).toHaveBeenCalled();

    expect(await screen.findByText(/password updated successfully/i)).toBeInTheDocument();
  });

  it("shows add-password flow for Google-only accounts", async () => {
    mockUser = {
      uid: "g1",
      email: "g@example.com",
      providerData: [
        {
          providerId: "google.com",
          uid: "google-g1",
          displayName: "G User",
          email: "g@example.com",
          phoneNumber: null,
          photoURL: null,
        },
      ],
      reload: jest.fn().mockResolvedValue(undefined),
    };
    (auth as unknown as { currentUser: typeof mockUser | null }).currentUser = mockUser;

    render(<SettingsPage />);

    expect(await screen.findByRole("heading", { name: /add a password/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/^new password$/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /confirm with google and add password/i })
    ).toBeInTheDocument();
  });

  it("validates add-password fields before calling Firebase", async () => {
    mockUser = {
      uid: "g1",
      email: "g@example.com",
      providerData: [
        {
          providerId: "google.com",
          uid: "google-g1",
          displayName: null,
          email: "g@example.com",
          phoneNumber: null,
          photoURL: null,
        },
      ],
      reload: jest.fn().mockResolvedValue(undefined),
    };
    (auth as unknown as { currentUser: typeof mockUser | null }).currentUser = mockUser;

    const user = userEvent.setup();
    render(<SettingsPage />);

    await screen.findByRole("heading", { name: /add a password/i });

    const newPw = screen.getAllByLabelText(/^new password$/i)[0];
    const confirmPw = screen.getByLabelText(/^confirm new password$/i);

    await user.type(newPw, "abcdef");
    await user.type(confirmPw, "abcdeg");

    await user.click(
      screen.getByRole("button", { name: /confirm with google and add password/i })
    );

    expect(await screen.findByRole("alert")).toHaveTextContent(/do not match/i);
    expect(reauthenticateWithPopup).not.toHaveBeenCalled();
  });
});
