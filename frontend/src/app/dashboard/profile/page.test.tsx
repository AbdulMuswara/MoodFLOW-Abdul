import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ProfilePage from "./page";

const replaceMock = jest.fn();
const mockRouter = {
  replace: replaceMock,
  push: jest.fn(),
};

let mockUser: {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
} | null = null;

jest.mock("next/navigation", () => ({
  useRouter: () => mockRouter,
}));

jest.mock("@/lib/firebase", () => ({
  auth: {},
  db: {},
}));

jest.mock("@/components/Navbar", () => ({
  __esModule: true,
  default: () => <nav data-testid="navbar" />,
}));

jest.mock("firebase/auth", () => ({
  onAuthStateChanged: jest.fn((_auth: unknown, callback: (u: typeof mockUser) => void) => {
    callback(mockUser);
    return jest.fn();
  }),
}));

jest.mock("firebase/firestore", () => ({
  doc: jest.fn(() => "mock-doc-ref"),
  getDoc: jest.fn(),
  setDoc: jest.fn(),
}));

const { getDoc, setDoc } = jest.requireMock("firebase/firestore") as {
  getDoc: jest.Mock;
  setDoc: jest.Mock;
};

async function waitForProfileForm() {
  await screen.findByLabelText(/^first name$/i);
}

describe("ProfilePage", () => {
  beforeEach(() => {
    replaceMock.mockClear();
    getDoc.mockClear();
    setDoc.mockClear();
    mockUser = {
      uid: "user-1",
      email: "pat@example.com",
      displayName: "Pat Display",
      photoURL: null,
    };

    getDoc.mockResolvedValue({
      exists: () => true,
      data: () => ({
        firstName: "Pat",
        lastName: "Lee",
        username: "patlee",
        bio: "Mood logger",
      }),
    });

    setDoc.mockResolvedValue(undefined);
  });

  it("redirects to login when there is no signed-in user", async () => {
    mockUser = null;
    render(<ProfilePage />);

    await waitFor(() => {
      expect(replaceMock).toHaveBeenCalledWith("/login");
    });
  });

  it("shows load error when getDoc fails", async () => {
    getDoc.mockRejectedValue(new Error("network"));
    render(<ProfilePage />);

    expect(await screen.findByText(/could not load your profile/i)).toBeInTheDocument();
  });

  it("saves trimmed profile data with setDoc", async () => {
    const user = userEvent.setup();
    render(<ProfilePage />);

    await waitForProfileForm();

    await user.clear(screen.getByLabelText(/^first name$/i));
    await user.type(screen.getByLabelText(/^first name$/i), "  Terry  ");

    await user.click(screen.getByRole("button", { name: /save changes/i }));

    await waitFor(() => {
      expect(setDoc).toHaveBeenCalled();
    });

    const [, payload] = setDoc.mock.calls[0];
    expect(payload).toMatchObject({
      uid: "user-1",
      email: "pat@example.com",
      username: "patlee",
      firstName: "Terry",
      lastName: "Lee",
      bio: "Mood logger",
    });

    expect(await screen.findByText(/changes saved successfully/i)).toBeInTheDocument();
  });

  it("uses Anonymous username when display name is empty", async () => {
    const u = userEvent.setup();
    getDoc.mockResolvedValue({
      exists: () => true,
      data: () => ({
        firstName: "",
        lastName: "",
        username: "",
        bio: "",
      }),
    });

    mockUser = {
      uid: "user-1",
      email: "pat@example.com",
      displayName: null,
      photoURL: null,
    };

    render(<ProfilePage />);

    await waitForProfileForm();

    await u.click(screen.getByRole("button", { name: /save changes/i }));

    await waitFor(() => {
      expect(setDoc).toHaveBeenCalled();
    });

    const [, payload] = setDoc.mock.calls[0];
    expect(payload).toMatchObject({
      username: "Anonymous",
      firstName: "",
      lastName: "",
      bio: "",
    });
  });

  it("discard restores fields from the last loaded baseline", async () => {
    const user = userEvent.setup();
    render(<ProfilePage />);

    await waitForProfileForm();

    await user.clear(screen.getByLabelText(/^first name$/i));
    await user.type(screen.getByLabelText(/^first name$/i), "Changed");

    expect(screen.getByLabelText(/^first name$/i)).toHaveValue("Changed");

    await user.click(screen.getByRole("button", { name: /discard/i }));

    expect(screen.getByLabelText(/^first name$/i)).toHaveValue("Pat");
  });

  it("shows save error when setDoc fails", async () => {
    setDoc.mockRejectedValue(new Error("permission"));
    const user = userEvent.setup();
    render(<ProfilePage />);

    await waitForProfileForm();

    await user.click(screen.getByRole("button", { name: /save changes/i }));

    expect(await screen.findByText(/could not save changes/i)).toBeInTheDocument();
  });

  it("loads profile fields from Firestore", async () => {
    render(<ProfilePage />);

    expect(await screen.findByRole("heading", { name: /your profile/i })).toBeInTheDocument();

    await waitForProfileForm();

    expect(screen.getByLabelText(/^first name$/i)).toHaveValue("Pat");
    expect(screen.getByLabelText(/^last name$/i)).toHaveValue("Lee");
    expect(screen.getByLabelText(/^display name$/i)).toHaveValue("patlee");
    expect(screen.getByLabelText(/^bio/i)).toHaveValue("Mood logger");
    expect(screen.getByLabelText(/^email address$/i)).toHaveValue("pat@example.com");
  });
});
