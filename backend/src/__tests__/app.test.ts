import request from "supertest";
import { createApp } from "../app";

describe("POST /analyzeMood", () => {

  it("returns a mood score from the analyzer", async () => {
    const fakeAnalyzer = {
      getAugmentedMoodScore: jest.fn().mockResolvedValue(4.5),
    } as any;

    const app = createApp(fakeAnalyzer);

    const response = await request(app)
      .post("/analyzeMood")
      .send({
        text: "I feel good",
        emojiScore: 4,
      });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ moodScore: 4.5 });
    expect(fakeAnalyzer.getAugmentedMoodScore).toHaveBeenCalledWith(
    "I feel good",
    4
    );
  });

  it("returns 500 when mood analysis fails", async () => {
  const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});

  const fakeAnalyzer = {
    getAugmentedMoodScore: jest.fn().mockRejectedValue(new Error("failed")),
  } as any;

  const app = createApp(fakeAnalyzer);

  const response = await request(app)
    .post("/analyzeMood")
    .send({
      text: "I feel bad",
      emojiScore: 2,
    });

  expect(response.status).toBe(500);
  expect(response.body).toEqual({ error: "Mood analysis failed" });

  consoleErrorSpy.mockRestore();
});

});