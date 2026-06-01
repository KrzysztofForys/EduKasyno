import { Pool } from "pg";

export const pool = new Pool({
  user: "postgres",
  host: "127.0.0.1",
  database: "edu_kasyno",
  password: "postgres", 
  port: 5432,
});