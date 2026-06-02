import { useState, useEffect, useRef } from "react";
import styles from "./Roulette.module.css";
import { useBalance } from "../context/BalanceContext"; // Import spójnego kontekstu salda

import {
  type RouletteNumber,
  type PayoutInfo,
  WHEEL_NUMBERS,
  BOARD_LAYOUT,
  CELL_W,
  CELL_H
} from "../components/roulette/rouletteTypes";
import { getTargetedNumbers } from "../components/roulette/rouletteLogic";
import { RouletteWheel } from "../components/roulette/RouletteWheel";
import { BettingTable } from "../components/roulette/BettingTable";
import { ResultModal } from "../components/roulette/ResultModal";

export const Roulette = () => {
  // Pobieramy globalne saldo i funkcje synchronizacji z bazą danych
  const { balance, refreshBalance, tryToChangeBalance } = useBalance();

  // ─── STAN GRY ──────────────────────────────────────────────────────────────
  const [selectedChip, setSelectedChip] = useState<number>(5);
  const [bets, setBets] = useState<Record<string, number>>({});
  const [spinning, setSpinning] = useState<boolean>(false);
  const [wheelAngle, setWheelAngle] = useState<number>(0);
  const [ballAngle, setBallAngle] = useState<number>(0);
  const [ballRadius, setBallRadius] = useState<number>(120); // Domyślnie startuje na wewnętrznym kółku z liczbami
  const [history, setHistory] = useState<RouletteNumber[]>([]);
  const [hoveredBetKey, setHoveredBetKey] = useState<string | null>(null);
  const [showResultModal, setShowResultModal] = useState<boolean>(false);
  const [payoutInfo, setPayoutInfo] = useState<PayoutInfo>({
    totalBet: 0,
    winAmount: 0,
    winningNum: null
  });

  const animationFrameId = useRef<number | null>(null);

  // Zabezpieczenie przed zachowaniem danych z serwera w trakcie pętli animacji
  const serverResultRef = useRef<{ winningIdx: number; winningItem: RouletteNumber; winAmount: number; totalBet: number } | null>(null);

  // ─── OBLICZENIA POCHODNE ────────────────────────────────────────────────────
  const totalBetAmount = Object.values(bets).reduce((acc, val) => acc + val, 0);
  const highlightedNumbers = hoveredBetKey ? getTargetedNumbers(hoveredBetKey) : [];

  // Współrzędne kulki (środek koła: 250, 250)
  const ballX = 250 + ballRadius * Math.cos(ballAngle * Math.PI / 180);
  const ballY = 250 + ballRadius * Math.sin(ballAngle * Math.PI / 180);

  // ─── HANDLERY ZAKŁADÓW ─────────────────────────────────────────────────────
  const handlePlaceBet = (betKey: string) => {
    if (spinning) return;

    // Weryfikacja za pomocą funkcji z BalanceContext
    if (!tryToChangeBalance(-selectedChip)) {
      return;
    }
    setBets(prev => ({ ...prev, [betKey]: (prev[betKey] || 0) + selectedChip }));
  };

  const handleRemoveBet = (e: React.MouseEvent, betKey: string) => {
    e.preventDefault();
    if (spinning || !bets[betKey]) return;
    const amountToRemove = Math.min(selectedChip, bets[betKey]);

    // Zwracamy żetony do salda w kontekście
    tryToChangeBalance(amountToRemove);
    setBets(prev => {
      const updated = { ...prev };
      if (updated[betKey] <= selectedChip) {
        delete updated[betKey];
      } else {
        updated[betKey] -= selectedChip;
      }
      return updated;
    });
  };

  const handleClearBets = () => {
    if (spinning) return;
    // Zwracamy całą sumę ze stołu na konto użytkownika przed czyszczeniem
    if (totalBetAmount > 0) {
      tryToChangeBalance(totalBetAmount);
    }
    setBets({});
  };

  // ─── HOVER NA SIATCE STOŁU ─────────────────────────────────────────────────
  const handleMouseMoveOnGrid = (e: React.MouseEvent<SVGRectElement>, col: number, row: number) => {
    if (spinning) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const localX = e.clientX - rect.left;
    const localY = e.clientY - rect.top;
    const margin = 12;

    const isLeft = localX < margin;
    const isRight = localX > CELL_W - margin;
    const isTop = localY < margin;
    const isBottom = localY > CELL_H - margin;

    // Corners
    if (isLeft && isTop && col > 0 && row > 0) { setHoveredBetKey(`corner-${col - 1}-${row - 1}`); return; }
    if (isRight && isTop && col < 11 && row > 0) { setHoveredBetKey(`corner-${col}-${row - 1}`); return; }
    if (isLeft && isBottom && col > 0 && row < 2) { setHoveredBetKey(`corner-${col - 1}-${row}`); return; }
    if (isRight && isBottom && col < 11 && row < 2) { setHoveredBetKey(`corner-${col}-${row}`); return; }

    // Six Lines
    if (isBottom && row === 2) {
      if (isLeft && col > 0) { setHoveredBetKey(`sixline-${col - 1}`); return; }
      if (isRight && col < 11) { setHoveredBetKey(`sixline-${col}`); return; }
    }
    if (isTop && row === 0) {
      if (isLeft && col > 0) { setHoveredBetKey(`sixline-${col - 1}`); return; }
      if (isRight && col < 11) { setHoveredBetKey(`sixline-${col}`); return; }
    }

    // Splits
    if (isLeft) {
      setHoveredBetKey(col === 0 ? `split-zero-${row}` : `split-h-${col - 1}-${row}`);
      return;
    }
    if (isRight && col < 11) { setHoveredBetKey(`split-h-${col}-${row}`); return; }
    if (isTop && row > 0) { setHoveredBetKey(`split-v-${col}-${row - 1}`); return; }
    if (isBottom && row < 2) { setHoveredBetKey(`split-v-${col}-${row}`); return; }

    // Straight Up — odczyt numeru bezpośrednio z BOARD_LAYOUT
    setHoveredBetKey(`straight-${BOARD_LAYOUT[row][col].value}`);
  };

  // ─── BEZPIECZNA ANIMACJA I POŁĄCZENIE Z BAZĄ ──────────────────────────────────
  const handleSpin = async () => {
    if (spinning || totalBetAmount === 0) return;

    const token = localStorage.getItem("token");
    if (!token) {
      alert("Błąd sesji. Zaloguj się ponownie.");
      return;
    }

    try {
      // 1. Wysyłamy zakłady na serwer w celu weryfikacji i wylosowania wyniku
      const response = await fetch("http://localhost:3001/api/games/roulette/play", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ bets })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        alert(data.error || "Wystąpił błąd podczas losowania ruletki.");
        return;
      }

      // Zapisujemy wynik w referencji, aby funkcja animująca miała do niego stały bezpieczny dostęp
      serverResultRef.current = {
        winningIdx: data.winningIdx,
        winningItem: data.winningItem,
        winAmount: data.winAmount,
        totalBet: data.totalBet
      };

      // 2. Blokujemy stół i zaczynamy animację fizyki koła
      setSpinning(true);
      setShowResultModal(false);

      const winningIdx = data.winningIdx;
      const animationDuration = 7000;
      const startTime = performance.now();
      const startWheelAngle = wheelAngle % 360;

      // Konfiguracja matematyki obrotu kulki względem koła (całkowicie płynny ruch)
      const stepAngle = 360 / WHEEL_NUMBERS.length;
      const winningPocketAngle = winningIdx * stepAngle;
      const targetWheelAngle = startWheelAngle + 360 * 6 - winningPocketAngle;

      const OUTER_RADIUS = 188;
      const INNER_RADIUS = 120;

      // Obliczanie docelowego kąta kulki w układzie współrzędnych koła
      const targetRelativeAngle = winningIdx * stepAngle + stepAngle / 2 - 90;
      
      // Losowa liczba pełnych obrotów kulki względem koła dla naturalności (od 7.5 do 9.5)
      const relativeRotations = 7.5 + Math.random() * 2;
      const startRelativeAngle = targetRelativeAngle + 360 * relativeRotations;

      const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

      const animate = (now: number) => {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / animationDuration, 1);

        // 1. Kąt koła (płynny obrót)
        const currentWheelAngle = startWheelAngle + (targetWheelAngle - startWheelAngle) * easeOutCubic(progress);
        setWheelAngle(currentWheelAngle);

        let currentBallAngle = 0;
        let currentBallRadius = INNER_RADIUS;

        // 2. Promień kulki (zsynchronizowany ze spowalnianiem kątowym)
        if (progress < 0.20) {
          // Faza rozbiegu: z koła wewnętrznego (120) na zewnętrzne (188)
          const spiralProgress = progress / 0.20;
          currentBallRadius = INNER_RADIUS + (OUTER_RADIUS - INNER_RADIUS) * Math.sin(spiralProgress * Math.PI / 2);
        } else if (progress < 0.55) {
          // Kręcenie się po zewnętrznym torze (188)
          currentBallRadius = OUTER_RADIUS;
        } else if (progress < 0.95) {
          // Faza opadania: z koła zewnętrznego (188) do wewnętrznego (120) - zsynchronizowana do końca zjazdu kulki (95%)
          const spiralProgress = (progress - 0.55) / 0.40;
          currentBallRadius = OUTER_RADIUS - (OUTER_RADIUS - INNER_RADIUS) * Math.sin(spiralProgress * Math.PI / 2);
        } else {
          // Spoczynek w kieszeni
          currentBallRadius = INNER_RADIUS;
        }

        // 3. Kąt kulki (płynne spowalnianie i dopasowanie do koła na finiszu 95%)
        if (progress < 0.95) {
          const progressToLanding = progress / 0.95;
          // Zastosowanie łagodnego profilu kwadratowego gwarantuje, że zatrzymanie i lądowanie kulki nastąpi dokładnie przy 95% czasu, w tym samym momencie w którym promień osiągnie 120.
          const easeFactor = Math.pow(1 - progressToLanding, 2.0);
          const currentRelativeAngle = targetRelativeAngle + (startRelativeAngle - targetRelativeAngle) * easeFactor;
          currentBallAngle = currentWheelAngle + currentRelativeAngle;
        } else {
          // Po 95% czasu kulka leży sztywno w kieszeni i obraca się dokładnie z kołem
          currentBallAngle = currentWheelAngle + targetRelativeAngle;
        }

        setBallAngle(currentBallAngle);
        setBallRadius(currentBallRadius);

        if (progress < 1) {
          animationFrameId.current = requestAnimationFrame(animate);
        } else {
          // ─── ZAKOŃCZENIE ANIMACJI ───
          setSpinning(false);
          const result = serverResultRef.current;

          if (result) {
            // Synchronizujemy licznik na ekranie z nowym stanem salda zapisanym na serwerze
            refreshBalance();

            // Przypisujemy dane do okna końcowego (Modal)
            setHistory(prev => [result.winningItem, ...prev.slice(0, 4)]);
            setPayoutInfo({
              totalBet: result.totalBet,
              winAmount: result.winAmount,
              winningNum: result.winningItem
            });

            // Czyścimy stół i pokazujemy modal z wygraną
            setBets({});
            setShowResultModal(true);
          }
        }
      };

      animationFrameId.current = requestAnimationFrame(animate);

    } catch (err) {
      console.error("Błąd połączenia z ruletką:", err);
      alert("Błąd sieciowy podczas komunikacji z serwerem kasyna.");
    }
  };

  // Sprzątanie referencji animacji po odmontowaniu
  useEffect(() => {
    return () => {
      if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
    };
  }, []);

  return (
    <div className={`page-content ${styles.rouletteContainer}`}>
      {/* Nagłówek */}
      <div className={styles.headerLayout}>
        <div>
          <h1 className={styles.title}>Ruletka Królewska</h1>
          <p className={styles.subtitle}>Poczuj emocje luksusowego, prawdziwego kasyna 3D</p>
        </div>
      </div>

      {/* Główna sekcja gry */}
      <div className={styles.gameLayout}>
        {/* LEWA STRONA: Koło ruletki */}
        <RouletteWheel
          wheelAngle={wheelAngle}
          ballX={ballX}
          ballY={ballY}
          history={history}
        />

        {/* PRAWA STRONA: Stół zakładowy */}
        <div className={styles.rightColumn}>
          <BettingTable
            bets={bets}
            hoveredBetKey={hoveredBetKey}
            highlightedNumbers={highlightedNumbers}
            spinning={spinning}
            onPlaceBet={handlePlaceBet}
            onRemoveBet={handleRemoveBet}
            onHoverChange={setHoveredBetKey}
            onMouseMoveOnGrid={handleMouseMoveOnGrid}
            selectedChip={selectedChip}
            onSelectChip={setSelectedChip}
            onClearBets={handleClearBets}
          />
        </div>
      </div>

      {/* Przycisk Zakręć kołem + suma zakładów */}
      <div className={styles.spinContainer}>
        <div className={styles.totalBetLabel}>
          Suma na stole:{" "}
          <span className={styles.totalBetAmount}>
            {totalBetAmount}
            <img src="zeton-portfel.svg" alt="Żeton" style={{ width: "18px", height: "18px" }} />
          </span>
        </div>
        <button
          onClick={handleSpin}
          disabled={spinning || totalBetAmount === 0}
          className={styles.spinBtn}
        >
          {spinning ? "Losowanie..." : "Zakręć kołem!"}
        </button>
        <p className={styles.helpText}>
          * Kliknij lewym przyciskiem, aby postawić żeton. Użyj prawego przycisku myszy na polu, aby go zdjąć.
        </p>
      </div>

      {/* Modal z wynikiem rundy */}
      <ResultModal
        show={showResultModal}
        payoutInfo={payoutInfo}
        onClose={() => setShowResultModal(false)}
      />
    </div>
  );
};