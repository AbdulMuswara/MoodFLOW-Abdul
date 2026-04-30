import express, { Request, Response } from "express";
import cors from "cors";
import { MoodAnalyzer } from "./services/MoodAnalyzer";

export function createApp(analyzer: MoodAnalyzer) {
  const app = express();

  app.use(cors());
  app.use(express.json());

  app.get("/", (req: Request, res: Response) => {
    res.send("MoodFLOW Backend API");
  });

  app.post("/analyzeMood", async (req, res) => {
    try {
      const { text, emojiScore } = req.body;
      const score = await analyzer.getAugmentedMoodScore(text, emojiScore);

      res.json({ moodScore: score });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Mood analysis failed" });
    }
  });

  app.get("/mood-trends", async (req: Request, res: Response): Promise<void> => {
    try {
      const uid = req.query.uid as string;
      const range = req.query.range as string || "7 Days";

      if (!uid) {
        res.status(400).json({ error: "uid is required" });
        return;
      }

      const { db } = await import("./firebaseAdmin");
      const ref = db.collection("users").doc(uid).collection("moodEntries");
      const snap = await ref.orderBy("date", "asc").get();

      let data = snap.docs.map((doc) => {
        const raw = doc.data();
        let dateObj = new Date(0);
        if (raw.date && typeof raw.date.toDate === "function") {
          dateObj = raw.date.toDate();
        }
        return {
          id: doc.id,
          emojiScore: raw.emojiScore,
          moodScore: raw.moodScore,
          date: dateObj,
        };
      });

      const now = new Date();
      if (range !== "All Time") {
        const days = range === "7 Days" ? 7 : range === "30 Days" ? 30 : 90;
        const cutoff = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
        data = data.filter((d) => d.date >= cutoff);
      }

      const formattedData = data.map((d) => ({
        dateLabel: d.date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        score: typeof d.moodScore === "number" ? d.moodScore : d.emojiScore,
      }));

      res.json({ chartData: formattedData });
    } catch (err) {
      console.error("Failed to fetch mood trends:", err);
      res.status(500).json({ error: "Failed to fetch mood trends" });
    }
  });

  return app;
}