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

for (const key of requiredEnv) {
  if (!process.env[key]) throw new Error(`Brak zmiennej środowiskowej ${key}`);
}

const app = express();

// Zezwolenie na zapytania z Twojego frontendu w React
app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

app.get("/", (request: Request, response: Response) => {
  response.send("Backend działa");
});

// POBIERANIE DANYCH PROFILU (DLA GRACZA ID = 1)
app.get("/api/profile", async (request: Request, response: Response) => {
  try {
    const idGracza = 1;

    // Pobierz login i saldo użytkownika
    const graczResult = await pool.query(
      "SELECT login, saldo FROM gracze WHERE id = $1",
      [idGracza]
    );

    if (graczResult.rows.length === 0) {
      return response.status(404).json({ message: "Brak gracza o ID 1 w bazie danych. Wykonaj zapytanie INSERT." });
    }

    const gracz = graczResult.rows[0];

    // Pobierz historię gier
    const historiaResult = await pool.query(
      "SELECT id, nazwa_gry, wynik FROM historia_gier WHERE id_gracza = $1 ORDER BY id DESC",
      [idGracza]
    );

    const historia = historiaResult.rows;
    const lacznieGier = historia.length;
    const sumaWygranych = historia
      .filter((gra) => gra.wynik > 0)
      .reduce((sum, gra) => sum + Number(gra.wynik), 0);

    response.json({
      login: gracz.login,
      saldo: Number(gracz.saldo),
      statystyki: {
        lacznieGier,
        sumaWygranych
      },
      historia: historia
    });

  } catch (error) {
    console.error("Błąd profilu:", error);
    response.status(500).json({ message: "Błąd serwera podczas pobierania profilu" });
  }
});

const PORT = Number(process.env.PORT) || 3001;
app.listen(PORT, () => {
  console.log(`Backend działa na http://localhost:${PORT}`);
});

// ZAPIS PRZEBIEGU GRY W ZDRAPKI I AKTUALIZACJA SALDA W BAZIE
app.post("/api/games/scratch/result", async (request: Request, response: Response) => {
  const client = await pool.connect(); // Używamy klienta do transakcji
  try {
    const idGracza = 1; // Na razie na sztywno
    const { wynik, koszt } = request.body; // Pobieramy dane wysłane z Reacta

    if (typeof wynik !== "number" || typeof koszt !== "number") {
      return response.status(400).json({ message: "Niepoprawne dane wejściowe." });
    }

    // Bilans operacji na saldzie (wygrana minus koszt zakupu karty)
    const zmianaSalda = wynik - koszt;

    await client.query("BEGIN"); // Rozpoczynamy transakcję

    // 1. Aktualizacja salda gracza w bazie danych
    const updateResult = await client.query(
      "UPDATE gracze SET saldo = saldo + $1 WHERE id = $2 RETURNING saldo",
      [zmianaSalda, idGracza]
    );

    if (updateResult.rows.length === 0) {
      throw new Error("Nie znaleziono gracza o ID 1 podczas aktualizacji salda.");
    }

    // 2. Dodanie wpisu do tabeli historia_gier
    // UWAGA: Jako wynik zapisujemy czysty zysk/stratę lub samą wygraną. Zapiszmy czysty wynik finansowy rundy.
    await client.query(
      "INSERT INTO historia_gier (id_gracza, nazwa_gry, wynik) VALUES ($1, 'Zdrapki', $2)",
      [idGracza, wynik]
    );

    await client.query("COMMIT"); // Zatwierdzamy zmiany w bazie

    const noweSaldo = Number(updateResult.rows[0].saldo);
    response.json({ message: "Gra zapisana pomyślnie", noweSaldo });

  } catch (error) {
    await client.query("ROLLBACK"); // W razie błędu cofamy zmiany w bazie
    console.error("Błąd zapisu gry:", error);
    response.status(500).json({ message: "Błąd serwera podczas zapisu gry." });
  } finally {
    client.release(); // Zwalniamy klienta z powrotem do puli
  }
});