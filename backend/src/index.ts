import dotenv from "dotenv";
import { db } from "./firebaseAdmin";
import { MoodAnalyzer } from "./services/MoodAnalyzer";
import { createApp } from "./app";

dotenv.config();

const port = parseInt(process.env.PORT as string, 10) || 8080;

const analyzer = new MoodAnalyzer();
const app = createApp(analyzer);

app.listen(port, "0.0.0.0", () => {
  console.log(`Server is running at http://0.0.0.0:${port}`);
}).on('error', (err) => {
  console.error("Server failed to start:", err);
});