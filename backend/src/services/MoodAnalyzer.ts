export class MoodAnalyzer {
    private classifier: any = null;

    constructor() {
        this.classifier = null;
    }

    async init() {
        if (!this.classifier) {
          const { pipeline } = await import("@xenova/transformers");
          this.classifier = await pipeline(
            "text-classification",
            "Xenova/distilbert-base-uncased-finetuned-sst-2-english"
          );
        }
    }

    computeScore(result: any) {
        const label = result[0].label;
        const confidence = result[0].score;
    
        let polarity = label === "POSITIVE"
            ? confidence
            : -confidence;
    
        const scaled = (polarity + 1) / 2;
        return 1 + scaled * 4;
    }

    async getMoodScore(text: string) {
        await this.init();
        const result = await this.classifier(text, { top_k: null });

        return this.computeScore(result);
    }

    async getAugmentedMoodScore(text: string, emojiScore: number) {
        const moodScore = await this.getMoodScore(text);
    
        return 0.3 * moodScore + 0.7 * emojiScore;
    }

}