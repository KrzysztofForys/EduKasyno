import express from "express";
import { type Response, type Request, type NextFunction } from "express";
import cors from "cors";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { Pool } from "pg";
dotenv.config();

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: Number(process.env.DB_PORT) || 5432
})
const JWT_SECRET = "super_tajny_klucz_kasyna_123!"; 
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


interface AuthenticatedRequest extends Request {
  userId?: number;
}

// MIDDLEWARE: Weryfikacja tokenu JWT
const autoryzacja = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(" ")[1];
  
  if (!token) {
    return res.status(401).json({ message: "Brak dostępu. Zaloguj się." });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
    req.userId = decoded.userId;
    next();
  } catch (error) {
    return res.status(403).json({ message: "Nieprawidłowy lub wygasły token." });
  }
};

// REJESTRACJA (Automatyczne 5000 PLN na start dla każdego)
app.post("/api/auth/register", async (req: Request, res: Response) => {
  try {
    const { login, haslo } = req.body;

    if (!login || !haslo) {
      return res.status(400).json({ message: "Uzupełnij login i hasło." });
    }

    const userExists = await pool.query("SELECT id FROM gracze WHERE login = $1", [login]);
    if (userExists.rows.length > 0) {
      return res.status(400).json({ message: "Ten login jest już zajęty." });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedHaslo = await bcrypt.hash(haslo, salt);

    // Zapisujemy gracza od razu z kwotą 5000.00 PLN w bazie
    await pool.query(
      "INSERT INTO gracze (login, haslo, saldo) VALUES ($1, $2, $3)",
      [login, hashedHaslo, 5000.00]
    );

    res.status(201).json({ message: "Konto utworzone pomyślnie z kwotą 5000 PLN!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Błąd serwera podczas rejestracji." });
  }
});

// LOGOWANIE (Generuje i wysyła token JWT)
app.post("/api/auth/login", async (req: Request, res: Response) => {
  try {
    const { login, haslo } = req.body;

    const result = await pool.query("SELECT id, login, haslo FROM gracze WHERE login = $1", [login]);
    if (result.rows.length === 0) {
      return res.status(400).json({ message: "Niepoprawny login lub hasło." });
    }

    const gracz = result.rows[0];
    const passwordMatch = await bcrypt.compare(haslo, gracz.haslo);

    if (!passwordMatch) {
      return res.status(400).json({ message: "Niepoprawny login lub hasło." });
    }

    const token = jwt.sign({ userId: gracz.id }, JWT_SECRET, { expiresIn: "1d" });

    res.json({ token, login: gracz.login });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Błąd serwera podczas logowania." });
  }
});

// POBIERANIE PROFILU GRACZA (Zliczanie statystyk bez kolumn zaklad/wygrana)
app.get("/api/profile", autoryzacja, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const idGracza = req.userId;

    const userResult = await pool.query(
      "SELECT id, login, saldo FROM gracze WHERE id = $1", 
      [idGracza]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: "Nie znaleziono gracza" });
    }

    const statsResult = await pool.query(
      `SELECT 
        COUNT(*) as "lacznieGier",
        COUNT(CASE WHEN wynik > 0 THEN 1 END) as "wygraneGier",
        COALESCE(SUM(CASE WHEN wynik > 0 THEN wynik ELSE 0 END), 0) as "sumaWygranych"
       FROM historia_gier 
       WHERE id_gracza = $1`,
      [idGracza]
    );

    const gracz = userResult.rows[0];
    const staty = statsResult.rows[0];

    res.json({
      id: gracz.id,
      login: gracz.login,
      saldo: Number(gracz.saldo),
      lacznieGier: Number(staty.lacznieGier) || 0,
      wygraneGier: Number(staty.wygraneGier) || 0,
      sumaWygranych: Number(staty.sumaWygranych) || 0
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Błąd serwera." });
  }
});

// POBIERANIE HISTORII (Bezpieczne pobieranie na podstawie podstawowych kolumn)
app.get("/api/profile/history", autoryzacja, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const idGracza = req.userId;
    const result = await pool.query(
      `SELECT nazwa_gry, wynik, data_gry 
       FROM historia_gier 
       WHERE id_gracza = $1 
       ORDER BY data_gry DESC 
       LIMIT 10`, 
      [idGracza]
    );
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Błąd pobierania historii" });
  }
});

// ZAPIS WYNIKU GRY 
app.post("/api/games/scratch/result", autoryzacja, async (req: AuthenticatedRequest, res: Response) => {
  const client = await pool.connect();
  try {
    const idGracza = req.userId;
    const { wynik, koszt } = req.body;

    const numWygrana = Number(wynik);
    const numZaklad = Number(koszt);
    const zmianaSalda = numWygrana - numZaklad;

    await client.query("BEGIN");

    const checkBalanceResult = await client.query("SELECT saldo FROM gracze WHERE id = $1", [idGracza]);
    const aktualneSaldoBazy = Number(checkBalanceResult.rows[0].saldo);

    if (aktualneSaldoBazy + zmianaSalda < 0) {
      await client.query("ROLLBACK");
      return res.status(400).json({ message: "Brak wystarczających środków na koncie!" });
    }

    const updateResult = await client.query(
      "UPDATE gracze SET saldo = saldo + $1 WHERE id = $2 RETURNING saldo",
      [zmianaSalda, idGracza]
    );

    await client.query(
      `INSERT INTO historia_gier (id_gracza, nazwa_gry, wynik) 
       VALUES ($1, 'Zdrapki', $2)`,
      [idGracza, numWygrana]
    );

    await client.query("COMMIT");

    res.json({ message: "Gra zapisana", noweSaldo: Number(updateResult.rows[0].saldo) });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error(error);
    res.status(500).json({ message: "Błąd serwera gier." });
  } finally {
    client.release();
  }
});

// RESET FINANSÓW (Czyści historię i przywraca 5000 PLN)
app.post("/api/profile/reset", autoryzacja, async (req: AuthenticatedRequest, res: Response) => {
  const client = await pool.connect();
  try {
    const idGracza = req.userId;

    await client.query("BEGIN");
    await client.query("DELETE FROM historia_gier WHERE id_gracza = $1", [idGracza]);
    await client.query("UPDATE gracze SET saldo = 5000.00 WHERE id = $1", [idGracza]);
    await client.query("COMMIT");

    res.json({ message: "Zresetowano finanse do 5000 PLN oraz wyczyszczono historię!" });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error(error);
    res.status(500).json({ message: "Błąd podczas resetowania danych." });
  } finally {
    client.release();
  }
});

app.listen(3001, () => {
  console.log(`Backend działający na http://localhost:3001`);
});