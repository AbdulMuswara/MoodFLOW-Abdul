import { render, screen, waitFor } from "@testing-library/react";
import MoodHistoryPage from "./page";

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

jest.mock("@/components/DashboardHeader", () => {
  return function DashboardHeader() {
    return <div data-testid="dashboard-header" />;
  };
});

jest.mock("firebase/auth", () => ({
  onAuthStateChanged: jest.fn((auth, callback) => {
    callback(mockUser);
    return jest.fn();
  }),
}));

jest.mock("firebase/firestore", () => ({
  collection: jest.fn(() => "mock-collection-ref"),
  getDocs: jest.fn(),
  orderBy: jest.fn(() => "mock-orderBy"),
  query: jest.fn(() => "mock-query"),
}));

const { getDocs } = require("firebase/firestore");

describe("MoodHistoryPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUser = null;
    getDocs.mockResolvedValue({ docs: [] });
  });

  it("renders the history page shell", async () => {
    render(<MoodHistoryPage />);

    expect(screen.getByText(/mood history/i)).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText(/search entries by note or date/i)
    ).toBeInTheDocument();

    expect(await screen.findByText(/total entries/i)).toBeInTheDocument();
  });

  it("shows the empty state when there are no entries", async () => {
    mockUser = { uid: "user-123" };
    getDocs.mockResolvedValue({ docs: [] });

    render(<MoodHistoryPage />);

    expect(
      await screen.findByText(/no mood entries found for the selected filters/i)
    ).toBeInTheDocument();
  });

  it("renders fetched mood entries", async () => {
    mockUser = { uid: "user-123" };

    getDocs.mockResolvedValue({
      docs: [
        {
          id: "entry-1",
          data: () => ({
            emojiScore: 4,
            moodScore: 3.67,
            note: "Worked on the MoodFLOW history page",
            date: {
              toDate: () => new Date(),
            },
          }),
        },
      ],
    });

    render(<MoodHistoryPage />);

    expect(
      await screen.findByText(/worked on the moodflow history page/i)
    ).toBeInTheDocument();

    expect(
        await screen.findByText(/worked on the moodflow history page/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/score: 3.67/i)).toBeInTheDocument();
  });
});