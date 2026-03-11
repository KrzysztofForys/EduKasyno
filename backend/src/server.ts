import express from "express";
import { type Response, type Request } from "express";
import cors from "cors";
import {Pool} from "pg";
const app = express();
app.use(cors({origin: 'http://localhost:5173'}))
app.use(express.json());

const pool = new Pool({
    user: "postgres",
    host: "localhost",
    database: "edu-kasyno",
    password: "postgres",
    port: 5432
})
app.listen(3001, () => {
  console.log('Backend działa na http://localhost:3001');
});