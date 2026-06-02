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
import { DEFLECTORS } from "../components/roulette/RouletteWheel";
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
  const [ballRadius, setBallRadius] = useState<number>(188);
  const [history, setHistory] = useState<RouletteNumber[]>([]);
  const [hoveredBetKey, setHoveredBetKey] = useState<string | null>(null);
  const [showResultModal, setShowResultModal] = useState<boolean>(false);
  const [payoutInfo, setPayoutInfo] = useState<PayoutInfo>({
    totalBet: 0,
    winAmount: 0,
    winningNum: null
  });

  const animationFrameId = useRef<number | null>(null);
  const bouncedDeflectors = useRef<Set<number>>(new Set());

  // Zabezpieczenie przed zachowaniem danych z serwera w trakcie pętli animacji
  const serverResultRef = useRef<{ winningIdx: number; winningItem: RouletteNumber; winAmount: number; totalBet: number } | null>(null);

  // ─── OBLICZENIA POCHODNE ────────────────────────────────────────────────────
  const totalBetAmount = Object.values(bets).reduce((acc, val) => acc + val, 0);
  const highlightedNumbers = hoveredBetKey ? getTargetedNumbers(hoveredBetKey) : [];

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

    if (isLeft && isTop && col > 0 && row > 0) { setHoveredBetKey(`corner-${col - 1}-${row - 1}`); return; }
    if (isRight && isTop && col < 11 && row > 0) { setHoveredBetKey(`corner-${col}-${row - 1}`); return; }
    if (isLeft && isBottom && col > 0 && row < 2) { setHoveredBetKey(`corner-${col - 1}-${row}`); return; }
    if (isRight && isBottom && col < 11 && row < 2) { setHoveredBetKey(`corner-${col}-${row}`); return; }

    if (isBottom && row === 2) {
      if (isLeft && col > 0) { setHoveredBetKey(`sixline-${col - 1}`); return; }
      if (isRight && col < 11) { setHoveredBetKey(`sixline-${col}`); return; }
    }
    if (isTop && row === 0) {
      if (isLeft && col > 0) { setHoveredBetKey(`sixline-${col - 1}`); return; }
      if (isRight && col < 11) { setHoveredBetKey(`sixline-${col}`); return; }
    }

    if (isLeft) {
      setHoveredBetKey(col === 0 ? `split-zero-${row}` : `split-h-${col - 1}-${row}`);
      return;
    }
    if (isRight && col < 11) { setHoveredBetKey(`split-h-${col}-${row}`); return; }
    if (isTop && row > 0) { setHoveredBetKey(`split-v-${col}-${row - 1}`); return; }
    if (isBottom && row < 2) { setHoveredBetKey(`split-v-${col}-${row}`); return; }

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

      const startBallAngleOffset = Math.random() * 360;
      const startBallAngle = (ballAngle + startBallAngleOffset) % 360;
      
      setBallAngle(startBallAngle);
      setBallRadius(20);
      const ballSpeedMultiplier = 0.95 + Math.random() * 0.10;

      const stepAngle = 360 / WHEEL_NUMBERS.length;
      const winningPocketAngle = winningIdx * stepAngle;
      const targetWheelAngle = startWheelAngle + 360 * 6 - winningPocketAngle;

      const OUTER_RADIUS = 188;
      const INNER_RADIUS = 120;
      const radiusAt070 = OUTER_RADIUS - (OUTER_RADIUS - INNER_RADIUS) * Math.pow(0.70 / 0.85, 3);

      const pocketCenterLocal = winningPocketAngle + stepAngle / 2;
      const totalBallRotations = 9;
      const ballAnglePhase1End = startBallAngle - totalBallRotations * 360 * ballSpeedMultiplier;

      const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

      const wheelAngleAt085 = startWheelAngle + (targetWheelAngle - startWheelAngle) * easeOutCubic(0.85);
      let targetAnglePhase3Start = pocketCenterLocal + wheelAngleAt085 - 90;

      while (targetAnglePhase3Start > ballAnglePhase1End) targetAnglePhase3Start -= 360;
      const diff = ballAnglePhase1End - targetAnglePhase3Start;
      targetAnglePhase3Start -= Math.floor((diff - 360) / 360) * 360;

      const animate = (now: number) => {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / animationDuration, 1);

        const currentWheelAngle = startWheelAngle + (targetWheelAngle - startWheelAngle) * easeOutCubic(progress);
        setWheelAngle(currentWheelAngle);

        let currentBallAngle = 0;
        let currentBallRadius = OUTER_RADIUS;

        if (progress < 0.70) {
          const baseAngle = startBallAngle - totalBallRotations * 360 * Math.pow(progress / 0.70, 1.2) * ballSpeedMultiplier;
          let baseRadius = OUTER_RADIUS;
          if (progress < 0.20) {
            const launchProgress = progress / 0.20;
            baseRadius = 20 + (OUTER_RADIUS - 20) * Math.sin(launchProgress * Math.PI / 2);
          } else {
            const trackProgress = (progress - 0.20) / 0.50;
            baseRadius = OUTER_RADIUS - (OUTER_RADIUS - radiusAt070) * Math.pow(trackProgress, 2);
          }

          let kickContrib = 0;
          let radiusBump = 0;

          if (progress >= 0.70) {
            bouncedDeflectors.current.clear();
          }

          DEFLECTORS.forEach((d, idx) => {
            if (bouncedDeflectors.current.has(idx)) return;
            const angleDiff = Math.abs(((baseAngle - d.deg + 540) % 360) - 180);
            const radiusProximity = baseRadius;
            if (radiusProximity > 160 && radiusProximity < 200 && angleDiff < 12) {
              const kick = (Math.random() > 0.5 ? 1 : -1) * (15 + Math.random() * 10);
              const radiusAdj = -5 - Math.random() * 5;
              kickContrib += kick;
              radiusBump += radiusAdj;
              bouncedDeflectors.current.add(idx);
            }
          });

          currentBallAngle = baseAngle + kickContrib;
          currentBallRadius = baseRadius + radiusBump;
        } else if (progress < 0.85) {
          const phaseProgress = (progress - 0.70) / 0.15;
          currentBallRadius = radiusAt070 - (radiusAt070 - INNER_RADIUS) * phaseProgress;
          currentBallAngle = ballAnglePhase1End + (targetAnglePhase3Start - ballAnglePhase1End) * phaseProgress;
        } else {
          currentBallRadius = INNER_RADIUS;
          currentBallAngle = targetAnglePhase3Start + (currentWheelAngle - wheelAngleAt085);
          if (progress < 0.93) {
            const bounceT = (progress - 0.85) / 0.08;
            currentBallRadius += Math.sin(bounceT * Math.PI) * 4.5;
          }
        }

        setBallAngle(currentBallAngle);
        setBallRadius(currentBallRadius);

        if (progress < 1) {
          animationFrameId.current = requestAnimationFrame(animate);
        } else {
          // ─── ZAKOŃCZENIE ANIMACJI KOŁA ───
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

  useEffect(() => {
    return () => {
      if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
    };
  }, []);

  return (
    <div className={`page-content ${styles.rouletteContainer}`}>
      <div className={styles.headerLayout}>
        <div>
          <h1 className={styles.title}>Ruletka Królewska</h1>
          <p className={styles.subtitle}>Poczuj emocje luksusowego, prawdziwego kasyna 3D</p>
        </div>
      </div>

      <div className={styles.gameLayout}>
        <RouletteWheel
          wheelAngle={wheelAngle}
          ballX={ballX}
          ballY={ballY}
          history={history}
        />

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

      <ResultModal
        show={showResultModal}
        payoutInfo={payoutInfo}
        onClose={() => setShowResultModal(false)}
      />
    </div>
  );
};