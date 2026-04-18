jest.mock("@xenova/transformers", () => ({
  pipeline: jest.fn(),
}));

import { MoodAnalyzer } from "../services/MoodAnalyzer";

describe("MoodAnalyzer", () => {
  let analyzer: MoodAnalyzer;

  beforeEach(() => {
    analyzer = new MoodAnalyzer();
  });

  describe("computeScore", () => {
    it("returns a high score for positive sentiment", () => {
      const result = [{ label: "POSITIVE", score: 0.9 }];

      const score = analyzer.computeScore(result);

      expect(score).toBeCloseTo(4.8);
    });

    it("returns a low score for negative sentiment", () => {
      const result = [{ label: "NEGATIVE", score: 0.9 }];

      const score = analyzer.computeScore(result);

      expect(score).toBeCloseTo(1.2);
    });
  });

  describe("getAugmentedMoodScore", () => {
    it("combines mood score and emoji score with the correct weights", async () => {
      jest.spyOn(analyzer, "getMoodScore").mockResolvedValue(5);

      const score = await analyzer.getAugmentedMoodScore("I feel amazing", 3);

      expect(score).toBeCloseTo(3.6);
    });
  });
});