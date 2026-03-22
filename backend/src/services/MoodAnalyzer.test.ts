jest.mock("@xenova/transformers", () => ({
  pipeline: jest.fn(),
}));

import { MoodAnalyzer } from "./MoodAnalyzer";

describe("MoodAnalyzer computeScore", () => {
  const analyzer = new MoodAnalyzer();

  it("maps a confident POSITIVE classification to a high mood score", () => {
    const result = [{ label: "POSITIVE", score: 0.9 }];
    expect(analyzer.computeScore(result)).toBeCloseTo(4.8, 5);
  });

  it("maps a confident NEGATIVE classification to a low mood score", () => {
    const result = [{ label: "NEGATIVE", score: 0.8 }];
    expect(analyzer.computeScore(result)).toBeCloseTo(1.4, 5);
  });

  it("throws when the model result is empty (invalid shape)", () => {
    expect(() => analyzer.computeScore([])).toThrow();
  });
});
