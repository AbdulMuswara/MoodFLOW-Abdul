import request from "supertest";
import { MoodAnalyzer } from "../services/MoodAnalyzer";
import { createApp } from "../app";

jest.mock("@xenova/transformers", () => ({
  pipeline: jest.fn(),
}));

const { pipeline } = jest.requireMock("@xenova/transformers") as {
  pipeline: jest.Mock;
};

describe("POST /analyzeMood (Express + MoodAnalyzer)", () => {
  beforeEach(() => {
    const classifier = jest
      .fn()
      .mockResolvedValue([{ label: "POSITIVE", score: 1 }]);
    pipeline.mockResolvedValue(classifier);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("returns augmented mood score for valid text and emojiScore", async () => {
    const app = createApp(new MoodAnalyzer());
    const moodFromText = 5;
    const emojiScore = 4;
    const expected = 0.3 * moodFromText + 0.7 * emojiScore;

    const res = await request(app)
      .post("/analyzeMood")
      .send({ text: "feeling great today", emojiScore })
      .set("Content-Type", "application/json");

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ moodScore: expected });
  });

  it("responds with 500 when mood analysis fails", async () => {
    const classifier = jest
      .fn()
      .mockRejectedValue(new Error("model unavailable"));
    pipeline.mockResolvedValue(classifier);

    const app = createApp(new MoodAnalyzer());

    const res = await request(app)
      .post("/analyzeMood")
      .send({ text: "hello", emojiScore: 3 })
      .set("Content-Type", "application/json");

    expect(res.status).toBe(500);
    expect(res.body).toEqual({ error: "Mood analysis failed" });
  });
});
