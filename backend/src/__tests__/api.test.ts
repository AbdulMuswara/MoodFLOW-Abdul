import request from "supertest";
import { createApp } from "../app";

describe("GET /", () => {
  it("should return the API message", async () => {
    const fakeAnalyzer = {
      getAugmentedMoodScore: jest.fn(),
    } as any;

    const app = createApp(fakeAnalyzer);

    const res = await request(app).get("/");

    expect(res.status).toBe(200);
    expect(res.text).toBe("MoodFLOW Backend API");
  });
});