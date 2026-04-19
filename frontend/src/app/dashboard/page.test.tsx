import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import DashboardPage from "./page";

const pushMock = jest.fn();
let mockUser: any = null;

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: pushMock,
  }),
}));

jest.mock("@/lib/firebase", () => ({
  auth: {},
  db: {},
}));

jest.mock("@/components/AvatarDropdown", () => {
  return function AvatarDropdown() {
    return <div data-testid="avatar-dropdown" />;
  };
});

jest.mock("firebase/auth", () => ({
  onAuthStateChanged: jest.fn((auth, callback) => {
    callback(mockUser);
    return jest.fn();
  }),
  signOut: jest.fn(),
}));

jest.mock("firebase/firestore", () => ({
  collection: jest.fn(() => "mock-collection-ref"),
  addDoc: jest.fn(),
  serverTimestamp: jest.fn(() => "mock-timestamp"),
  doc: jest.fn(() => "mock-doc-ref"),
  getDoc: jest.fn(),
  getDocs: jest.fn(),
  query: jest.fn(() => "mock-query"),
  orderBy: jest.fn(() => "mock-orderBy"),
  limit: jest.fn(() => "mock-limit"),
}));

const { addDoc, getDoc, getDocs } = require("firebase/firestore");

describe("DashboardPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUser = null;

    getDoc.mockResolvedValue({
      exists: () => false,
      data: () => ({}),
    });

    getDocs.mockResolvedValue({ docs: [] });

    (global as any).fetch = jest.fn();
  });

  it("renders the main dashboard sections", () => {
    render(<DashboardPage />);

    expect(screen.getByText(/log your mood/i)).toBeInTheDocument();
    expect(screen.getByText(/recent entries/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /save entry/i })).toBeInTheDocument();
    expect(
      screen.getByText(/no mood entries yet\. save your first entry above\./i)
    ).toBeInTheDocument();
  });

  it("shows an error when saving while unauthenticated", async () => {
    render(<DashboardPage />);

    fireEvent.click(screen.getByRole("button", { name: /save entry/i }));

    expect(await screen.findByText(/user not authenticated/i)).toBeInTheDocument();
  });

  it("shows an error when an authenticated user saves with no input", async () => {
    mockUser = { uid: "user-123" };

    render(<DashboardPage />);

    fireEvent.click(screen.getByRole("button", { name: /save entry/i }));

    expect(await screen.findByText(/no input provided/i)).toBeInTheDocument();
  });

  it("saves a mood entry successfully", async () => {
    mockUser = { uid: "user-123" };

    (global as any).fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ moodScore: 4.2 }),
    });

    render(<DashboardPage />);

    fireEvent.click(screen.getByRole("button", { name: /good/i }));

    fireEvent.change(screen.getByLabelText(/what did you work on today\?/i), {
      target: { value: "Worked on dashboard tests" },
    });

    fireEvent.click(screen.getByRole("button", { name: /save entry/i }));

    await waitFor(() => {
      expect((global as any).fetch).toHaveBeenCalledWith(
        "http://localhost:3001/analyzeMood",
        expect.objectContaining({
          method: "POST",
          headers: { "Content-Type": "application/json" },
        })
      );
    });

    await waitFor(() => {
      expect(addDoc).toHaveBeenCalledWith(
        "mock-collection-ref",
        expect.objectContaining({
          emojiScore: 4,
          moodScore: 4.2,
          note: "Worked on dashboard tests",
          date: "mock-timestamp",
        })
      );
    });

    expect(await screen.findByText(/entry saved\./i)).toBeInTheDocument();
  });
});