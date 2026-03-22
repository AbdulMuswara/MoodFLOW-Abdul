import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { db } from "./firebaseAdmin";
import { MoodAnalyzer } from './services/MoodAnalyzer';
import { createApp } from "./app";

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

const analyzer = new MoodAnalyzer();

app.use(cors());
app.use(express.json());

app.get('/', (req: Request, res: Response) => {
  res.send('MoodFLOW Backend API');
});
const app = createApp(analyzer);

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
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