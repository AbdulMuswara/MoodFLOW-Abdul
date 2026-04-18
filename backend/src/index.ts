import dotenv from "dotenv";
import { db } from "./firebaseAdmin";
import { MoodAnalyzer } from "./services/MoodAnalyzer";
import { createApp } from "./app";

dotenv.config();

const port = process.env.PORT || 3001;

const analyzer = new MoodAnalyzer();
const app = createApp(analyzer);

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});