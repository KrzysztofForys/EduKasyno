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

    // Zapisujemy gracza od razu z kwotą 10000.00 PLN w bazie
    await pool.query(
      "INSERT INTO gracze (login, haslo, saldo) VALUES ($1, $2, $3)",
      [login, hashedHaslo, 10000.00]
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
  const client = await pool.connect();

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
    const userRes = await client.query("SELECT saldo FROM gracze WHERE id = $1 FOR UPDATE", [userId]);
    if (userRes.rows.length === 0) {
      return res.status(404).json({ error: "Nie znaleziono gracza" });
    }

    const aktualneSaldo = Number(userRes.rows[0].saldo);
    if (aktualneSaldo < bet) {
      return res.status(400).json({ error: "Niewystarczające środki na koncie!" });
    }
    await client.query("BEGIN");
    await client.query("UPDATE gracze SET saldo = saldo - $1 WHERE id = $2", [bet, userId]);


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

    // 3. Aktualizacja bazy danych (Zapis salda)
    const updateRes = await client.query(
      "UPDATE gracze SET saldo = saldo + $1 WHERE id = $2 RETURNING saldo",
      [winAmount, userId]
    );
    const noweSaldo = Number(updateRes.rows[0].saldo);

    // 4. Zapis do historii (Dokładnie jeden raz!)
    await client.query(
      "INSERT INTO historia_gier (id_gracza, nazwa_gry, wynik, data_gry) VALUES ($1, $2, $3, NOW())",
      [userId, "Sloty", winAmount]
    );
    client.query("COMMIT");
    // 5. Zwracamy komplet danych do wyświetlenia animacji
    return res.json({
      success: true,
      symbols: wylosowaneSymbole,
      winAmount,
      message,
      noweSaldo
    });

  } catch (err) {
    client.query("ROLLBACK");
    console.error("Błąd serwera podczas gry w sloty:", err);
    return res.status(500).json({ error: "Błąd serwera" });
  }
  finally {
    client.release();
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

// NOWY BEZPIECZNY ENDPOINT RULETKI (Losowanie i rozliczanie na serwerze)
app.post("/api/games/roulette/play", autoryzacja, async (req: AuthenticatedRequest, res: Response) => {
  const { bets } = req.body; // bets to obiekt typu Record<string, number> np. { "straight-14": 10, "outside-red": 25 }
  const userId = req.userId;

  if (!bets || Object.keys(bets).length === 0) {
    return res.status(400).json({ error: "Brak postawionych zakładów na stole." });
  }

  // Obliczamy łączną kwotę wszystkich zakładów na stole
  const totalBetAmount = Object.values(bets).reduce((acc: number, val: any) => acc + Number(val), 0);

  if (totalBetAmount <= 0) {
    return res.status(400).json({ error: "Nieprawidłowa stawka zakładów." });
  }

  // Definicja koła ruletki (Układ europejski) do weryfikacji koloru
  const WHEEL_NUMBERS_DB = [
    { value: 0, color: "green" }, { value: 32, color: "red" }, { value: 15, color: "black" },
    { value: 19, color: "red" }, { value: 4, color: "black" }, { value: 21, color: "red" },
    { value: 2, color: "black" }, { value: 25, color: "red" }, { value: 17, color: "black" },
    { value: 34, color: "red" }, { value: 6, color: "black" }, { value: 27, color: "red" },
    { value: 13, color: "black" }, { value: 36, color: "red" }, { value: 11, color: "black" },
    { value: 30, color: "red" }, { value: 8, color: "black" }, { value: 23, color: "red" },
    { value: 10, color: "black" }, { value: 5, color: "red" }, { value: 24, color: "black" },
    { value: 16, color: "red" }, { value: 33, color: "black" }, { value: 1, color: "red" },
    { value: 20, color: "black" }, { value: 14, color: "red" }, { value: 31, color: "black" },
    { value: 9, color: "red" }, { value: 22, color: "black" }, { value: 18, color: "red" },
    { value: 29, color: "black" }, { value: 7, color: "red" }, { value: 28, color: "black" },
    { value: 12, color: "red" }, { value: 35, color: "black" }, { value: 3, color: "red" },
    { value: 26, color: "black" }
  ];

  // Układ planszy (3 wiersze, 12 kolumn) do wyznaczania numerów w zakładach złożonych
  const BOARD_LAYOUT_DB = [
    [3, 6, 9, 12, 15, 18, 21, 24, 27, 30, 33, 36],
    [2, 5, 8, 11, 14, 17, 20, 23, 26, 29, 32, 35],
    [1, 4, 7, 10, 13, 16, 19, 22, 25, 28, 31, 34]
  ];

  // Funkcja pomocnicza serwera do sprawdzenia jakie numery pokrywa dany betKey
  const getNumbersForBetKey = (key: string): number[] => {
    if (key.startsWith("straight-")) {
      return [parseInt(key.replace("straight-", ""), 10)];
    }
    if (key.startsWith("split-h-")) {
      const parts = key.replace("split-h-", "").split("-");
      const col = parseInt(parts[0], 10);
      const row = parseInt(parts[1], 10);
      return [BOARD_LAYOUT_DB[row][col], BOARD_LAYOUT_DB[row][col + 1]];
    }
    if (key.startsWith("split-v-")) {
      const parts = key.replace("split-v-", "").split("-");
      const col = parseInt(parts[0], 10);
      const row = parseInt(parts[1], 10);
      return [BOARD_LAYOUT_DB[row][col], BOARD_LAYOUT_DB[row + 1][col]];
    }
    if (key.startsWith("split-zero-")) {
      const row = parseInt(key.replace("split-zero-", ""), 10);
      return [0, BOARD_LAYOUT_DB[row][0]];
    }
    if (key.startsWith("corner-")) {
      const parts = key.replace("corner-", "").split("-");
      const col = parseInt(parts[0], 10);
      const row = parseInt(parts[1], 10);
      return [
        BOARD_LAYOUT_DB[row][col], BOARD_LAYOUT_DB[row][col + 1],
        BOARD_LAYOUT_DB[row + 1][col], BOARD_LAYOUT_DB[row + 1][col + 1]
      ];
    }
    if (key.startsWith("sixline-")) {
      const col = parseInt(key.replace("sixline-", ""), 10);
      const nums: number[] = [];
      for (let r = 0; r < 3; r++) {
        nums.push(BOARD_LAYOUT_DB[r][col], BOARD_LAYOUT_DB[r][col + 1]);
      }
      return nums;
    }
    if (key.startsWith("column-")) {
      const row = parseInt(key.replace("column-", ""), 10);
      return BOARD_LAYOUT_DB[row];
    }
    if (key.startsWith("dozen-")) {
      const idx = parseInt(key.replace("dozen-", ""), 10);
      const start = (idx - 1) * 12 + 1;
      const nums: number[] = [];
      for (let i = start; i <= idx * 12; i++) nums.push(i);
      return nums;
    }
    if (key === "outside-red") return WHEEL_NUMBERS_DB.filter(n => n.color === "red").map(n => n.value);
    if (key === "outside-black") return WHEEL_NUMBERS_DB.filter(n => n.color === "black").map(n => n.value);
    if (key === "outside-even") return Array.from({ length: 36 }, (_, i) => i + 1).filter(n => n % 2 === 0);
    if (key === "outside-odd") return Array.from({ length: 36 }, (_, i) => i + 1).filter(n => n % 2 !== 0);
    if (key === "outside-low") return Array.from({ length: 18 }, (_, i) => i + 1);
    if (key === "outside-high") return Array.from({ length: 18 }, (_, i) => i + 19);
    return [];
  };
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    // Sprawdzamy czy gracz istnieje i ma fundusze
    const userRes = await client.query("SELECT saldo FROM gracze WHERE id = $1 FOR UPDATE", [userId]);
    if (userRes.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "Nie znaleziono gracza" });
    }

    const aktualneSaldo = Number(userRes.rows[0].saldo);
    if (aktualneSaldo < totalBetAmount) {
      await client.query("ROLLBACK");
      return res.status(400).json({ error: "Niewystarczające środki na koncie na te zakłady!" });
    }
    await client.query(
      "UPDATE gracze SET saldo = saldo - $1 WHERE id = $2",
      [totalBetAmount, userId]
    );

    // 1. LOSOWANIE NUMERU NA BACKENDZIE
    const winningIdx = Math.floor(Math.random() * WHEEL_NUMBERS_DB.length);
    const winningItem = WHEEL_NUMBERS_DB[winningIdx];

    // 2. OBLICZANIE WYGRANEJ
    let totalWinAmount = 0;

    Object.entries(bets).forEach(([betKey, betValue]) => {
      const val = Number(betValue);
      if (val <= 0) return;

      const coveredNums = getNumbersForBetKey(betKey);
      if (coveredNums.includes(winningItem.value)) {
        if (betKey.startsWith("straight-")) totalWinAmount += val * 36;
        else if (betKey.startsWith("split-")) totalWinAmount += val * 18;
        else if (betKey.startsWith("corner-")) totalWinAmount += val * 9;
        else if (betKey.startsWith("sixline-")) totalWinAmount += val * 6;
        else if (betKey.startsWith("column-") || betKey.startsWith("dozen-")) totalWinAmount += val * 3;
        else totalWinAmount += val * 2; // zakłady zewnętrzne (kolory, parzyste/nieparzyste itp.)
      }
    });

    // 3. AKTUALIZACJA SALDA W BAZIE DANYCH
    const updateRes = await client.query(
      "UPDATE gracze SET saldo = saldo + $1 WHERE id = $2 RETURNING saldo",
      [totalWinAmount, userId]
    );
    const noweSaldo = Number(updateRes.rows[0].saldo);

    // 4. JEDNORAZOWY ZAPIS ROZGRYWKI DO HISTORII
    await client.query(
      "INSERT INTO historia_gier (id_gracza, nazwa_gry, wynik, data_gry) VALUES ($1, $2, $3, NOW())",
      [userId, "Ruletka", totalWinAmount]
    );

    await client.query("COMMIT");

    return res.json({
      success: true,
      winningIdx,
      winningItem,
      winAmount: totalWinAmount,
      totalBet: totalBetAmount,
      noweSaldo
    });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Błąd serwera podczas gry w ruletkę:", err);

    return res.status(500).json({ error: "Błąd serwera" });
  }
  finally {
    client.release();
  }
});

app.listen(3001, () => {
  console.log(`Backend działający na http://localhost:3001`);
});