import express from "express";
import { type Response, type Request, type NextFunction } from "express";
import cors from "cors";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { pool } from "./db";
dotenv.config();

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
app.use(cors({ origin: 'http://localhost:5173' }));
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

// REJESTRACJA
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

    await pool.query(
      "INSERT INTO gracze (login, haslo, saldo) VALUES ($1, $2, 10000)",
      [login, hashedHaslo]
    );

    res.status(201).json({ message: "Konto utworzone pomyślnie! Otrzymujesz 10 000 żetonów na start. Możesz się zalogować." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Błąd serwera podczas rejestracji." });
  }
});

// LOGOWANIE
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

// POBIERANIE PROFILU GRACZA
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

// POBIERANIE HISTORII
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

// Endpoint obsługujący wynik zdrapki
app.post("/api/games/scratch/result", autoryzacja, async (req: AuthenticatedRequest, res: Response) => {
  const { koszt, wynik } = req.body; 
  const userId = req.userId;

  if (koszt === undefined || wynik === undefined) {
    return res.status(400).json({ error: "Brak wymaganych danych rozgrywki." });
  }

  try {
    const userRes = await pool.query("SELECT saldo FROM gracze WHERE id = $1", [userId]);
    if (userRes.rows.length === 0) {
      return res.status(404).json({ error: "Nie znaleziono gracza" });
    }

    const aktualneSaldo = Number(userRes.rows[0].saldo);
    if (aktualneSaldo < koszt) {
      return res.status(400).json({ error: "Brak wystarczającej ilości żetonów!" });
    }

    const zmianaSalda = wynik - koszt;

    const updateRes = await pool.query(
      "UPDATE gracze SET saldo = saldo + $1 WHERE id = $2 RETURNING saldo",
      [zmianaSalda, userId]
    );

    const noweSaldo = updateRes.rows[0].saldo;

    await pool.query(
      "INSERT INTO historia_gier (id_gracza, nazwa_gry, wynik, data_gry) VALUES ($1, $2, $3, NOW())",
      [userId, "Zdrapka", wynik]
    );

    return res.json({ 
      success: true, 
      noweSaldo: Number(noweSaldo),
      message: "Wynik zdrapki zapisany pomyślnie" 
    });

  } catch (err) {
    console.error("Błąd podczas przetwarzania zdrapki:", err);
    return res.status(500).json({ error: "Błąd serwera" });
  }
});

// NOWY BEZPIECZNY ENDPOINT SLOTÓW (Losowanie na serwerze - wyklucza podwójne wpisy i błędy salda)
app.post("/api/games/slots/play", autoryzacja, async (req: AuthenticatedRequest, res: Response) => {
  const { bet } = req.body;
  const userId = req.userId;

  if (!bet || bet <= 0) {
    return res.status(400).json({ error: "Nieprawidłowa stawka zakręcenia." });
  }

  const SYMBOLS = ["czeresnia", "cytryna", "arbuz", "pomarancza", "winogrono", "bar", "siedem"];
  const MULTIPLIERS: Record<string, number> = {
    "czeresnia": 1,
    "cytryna": 1.5,
    "arbuz": 2,
    "pomarancza": 2,
    "winogrono": 3,
    "bar": 5,
    "siedem": 10 
  };

  try {
    const userRes = await pool.query("SELECT saldo FROM gracze WHERE id = $1", [userId]);
    if (userRes.rows.length === 0) {
      return res.status(404).json({ error: "Nie znaleziono gracza" });
    }

    const aktualneSaldo = Number(userRes.rows[0].saldo);
    if (aktualneSaldo < bet) {
      return res.status(400).json({ error: "Niewystarczające środki na koncie!" });
    }

    // 1. Losowanie symboli na backendzie
    const s1 = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
    const s2 = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
    const s3 = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
    const wylosowaneSymbole = [s1, s2, s3];

    // 2. Obliczanie wygranej
    let winAmount = 0;
    let message = "Spróbuj ponownie.";

    if (s1 === s2 && s2 === s3) {
      const mult = MULTIPLIERS[s1] * 5;
      winAmount = bet * mult;
      message = `SUPER JACKPOT x${mult}!`;
    } else if (s1 === s2 || s1 === s3) {
      const mult = Math.max(0.5, MULTIPLIERS[s1] * 0.6);
      winAmount = Math.round(bet * mult);
      message = `Para! Wygrana x${mult.toFixed(1)}`;
    } else if (s2 === s3) {
      const mult = Math.max(0.5, MULTIPLIERS[s2] * 0.6);
      winAmount = Math.round(bet * mult);
      message = `Para! Wygrana x${mult.toFixed(1)}`;
    }

    const zmianaSalda = winAmount - bet;

    // 3. Aktualizacja bazy danych (Zapis salda)
    const updateRes = await pool.query(
      "UPDATE gracze SET saldo = saldo + $1 WHERE id = $2 RETURNING saldo",
      [zmianaSalda, userId]
    );
    const noweSaldo = Number(updateRes.rows[0].saldo);

    // 4. Zapis do historii (Dokładnie jeden raz!)
    await pool.query(
      "INSERT INTO historia_gier (id_gracza, nazwa_gry, wynik, data_gry) VALUES ($1, $2, $3, NOW())",
      [userId, "Sloty", winAmount]
    );

    // 5. Zwracamy komplet danych do wyświetlenia animacji
    return res.json({
      success: true,
      symbols: wylosowaneSymbole,
      winAmount,
      message,
      noweSaldo
    });

  } catch (err) {
    console.error("Błąd serwera podczas gry w sloty:", err);
    return res.status(500).json({ error: "Błąd serwera" });
  }
});

// RESET FINANSÓW
app.post("/api/profile/reset", autoryzacja, async (req: AuthenticatedRequest, res: Response) => {
  const client = await pool.connect();
  try {
    const idGracza = req.userId;

    await client.query("BEGIN");
    await client.query("DELETE FROM historia_gier WHERE id_gracza = $1", [idGracza]);
    await client.query("UPDATE gracze SET saldo = 10000.00 WHERE id = $1", [idGracza]);
    await client.query("COMMIT");

    res.json({ message: "Zresetowano finanse do 10000 PLN oraz wyczyszczono historię!" });
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