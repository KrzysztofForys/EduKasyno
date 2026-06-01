import express from "express";
import { type Response, type Request } from "express";
import cors from "cors";
import { pool } from "./db";
import dotenv from "dotenv";
dotenv.config();


const requiredEnv = [
  "DB_USER",
  "DB_HOST",
  "DB_NAME",
  "DB_PASSWORD",
  "DB_PORT",
];

for (const key of requiredEnv) if (!process.env[key]) throw new Error(`Brak zmiennej środowiskowej ${key}`);

const app = express();
app.use(cors({ origin: 'http://localhost:5173' }))
app.use(express.json());



app.get("/", (request: Request, response: Response) => {
  response.send("Backend działa");
})
const PORT = Number(process.env.PORT) || 3001;
app.listen(PORT, () => {
  console.log(`Backend działa na http://localhost:${PORT}`);
});