import { useState } from "react";
import styles from "./Scratch.module.css";
import { ScratchCard } from "../components/ScratchCard";
import { audio } from "../utils/audio";

type ScratchProps = {
  balance: number;
  setBalance: React.Dispatch<React.SetStateAction<number>>;
};

// Define Card configurations for Lobby
interface CardConfig {
  id: "classic" | "gold" | "extreme";
  name: string;
  tag: string;
  tagClass: string;
  tierClass: string;
  desc: string;
  cost: number;
  icon: string;
  width: number;
  height: number;
}

const CARDS_LOBBY: CardConfig[] = [
  {
    id: "classic",
    name: "Szczęśliwa Koniczyna",
    tag: "Classic",
    tagClass: styles.classicTag,
    tierClass: styles.classicTier,
    desc: "Częste, drobne wygrane. Znajdź trzy identyczne kwoty i zgarnij nagrodę!",
    cost: 10,
    icon: "🍀",
    width: 320,
    height: 340,
  },
  {
    id: "gold",
    name: "Złoty Skarbiec",
    tag: "Premium",
    tagClass: styles.goldTag,
    tierClass: styles.goldTier,
    desc: "Zwiększone ryzyko, luksusowe nagrody. Dopasuj Twoje Liczby do Zwycięskich!",
    cost: 50,
    icon: "💰",
    width: 340,
    height: 420,
  },
  {
    id: "extreme",
    name: "Kosmiczny Neon",
    tag: "Extreme",
    tagClass: styles.extremeTag,
    tierClass: styles.extremeTier,
    desc: "Ogromne wygrane, wysokie ryzyko. Odkryj cenne kryształy pomnożone przez kosmiczny mnożnik!",
    cost: 200,
    icon: "⚡",
    width: 360,
    height: 440,
  },
];

// Scratch Card State Definitions
interface ClassicCardState {
  fields: { amount: number; isWinning: boolean }[];
}

interface GoldCardState {
  winningNumbers: number[];
  playerCards: { number: number; prize: number; isWinning: boolean }[];
}

interface ExtremeCardState {
  multiplier: number;
  boxes: { prize: number; isWinning: boolean }[];
}

type CardState =
  | { type: "classic"; data: ClassicCardState }
  | { type: "gold"; data: GoldCardState }
  | { type: "extreme"; data: ExtremeCardState };

export const Scratch = ({ balance, setBalance }: ScratchProps) => {
  const [gameState, setGameState] = useState<"lobby" | "playing" | "revealing" | "complete">("lobby");
  const [activeCard, setActiveCard] = useState<CardConfig | null>(null);
  const [cardState, setCardState] = useState<CardState | null>(null);
  const [isCanvasRevealed, setIsCanvasRevealed] = useState(false);
  const [payout, setPayout] = useState(0);
  const [showResultModal, setShowResultModal] = useState(false);

  // Generate Card values on buy
  const handleBuyCard = (card: CardConfig) => {
    if (balance < card.cost) return;

    // Deduct cost and play buying sound
    setBalance((prev) => prev - card.cost);
    audio.playCoinSound();

    setActiveCard(card);
    setIsCanvasRevealed(false);
    setPayout(0);
    setShowResultModal(false);

    // Generate specific card logic
    let generatedState: CardState;
    if (card.id === "classic") {
      generatedState = { type: "classic", data: generateClassicCard() };
    } else if (card.id === "gold") {
      generatedState = { type: "gold", data: generateGoldCard() };
    } else {
      generatedState = { type: "extreme", data: generateExtremeCard() };
    }

    setCardState(generatedState);
    setGameState("playing");
  };

  // --- GAME GENERATORS (Weighted Probabilities) ---

  const generateClassicCard = (): ClassicCardState => {
    const amounts = [2, 5, 10, 20, 50, 100, 500];
    const isWin = Math.random() < 0.42; // ~42% win rate

    if (isWin) {
      // Choose winning amount
      // Lower amounts are much more likely
      const roll = Math.random();
      let winAmt = 2;
      if (roll > 0.96) winAmt = 500;
      else if (roll > 0.9) winAmt = 100;
      else if (roll > 0.75) winAmt = 50;
      else if (roll > 0.5) winAmt = 20;
      else if (roll > 0.25) winAmt = 10;
      else winAmt = 5;

      const fields = Array(9).fill(0);
      // Place 3 winning amounts
      const winIndices = new Set<number>();
      while (winIndices.size < 3) {
        winIndices.add(Math.floor(Math.random() * 9));
      }

      winIndices.forEach((idx) => {
        fields[idx] = { amount: winAmt, isWinning: true };
      });

      // Fill remaining 6 with random amounts, ensuring no other has 3 matches
      const counts: Record<number, number> = { [winAmt]: 3 };
      for (let i = 0; i < 9; i++) {
        if (fields[i] !== 0) continue;

        let randAmt = winAmt;
        while (randAmt === winAmt || (counts[randAmt] || 0) >= 2) {
          randAmt = amounts[Math.floor(Math.random() * amounts.length)];
        }
        counts[randAmt] = (counts[randAmt] || 0) + 1;
        fields[i] = { amount: randAmt, isWinning: false };
      }

      return { fields };
    } else {
      // Lose: Fill 9 spaces such that no value repeats 3 times
      const fields = Array(9).fill(null);
      const counts: Record<number, number> = {};
      for (let i = 0; i < 9; i++) {
        let randAmt = 2;
        do {
          randAmt = amounts[Math.floor(Math.random() * amounts.length)];
        } while ((counts[randAmt] || 0) >= 2);

        counts[randAmt] = (counts[randAmt] || 0) + 1;
        fields[i] = { amount: randAmt, isWinning: false };
      }
      return { fields };
    }
  };

  const generateGoldCard = (): GoldCardState => {
    const isWin = Math.random() < 0.35; // 35% win rate
    const winningNumbers: number[] = [];
    while (winningNumbers.length < 2) {
      const n = Math.floor(Math.random() * 89) + 10;
      if (!winningNumbers.includes(n)) winningNumbers.push(n);
    }

    const playerCards: { number: number; prize: number; isWinning: boolean }[] = [];

    // Helper to get weighted prize
    const getPrize = () => {
      const roll = Math.random();
      if (roll > 0.98) return 2500;
      if (roll > 0.92) return 500;
      if (roll > 0.8) return 200;
      if (roll > 0.6) return 100;
      if (roll > 0.3) return 50;
      return Math.random() < 0.5 ? 20 : 10;
    };

    if (isWin) {
      // Pick 1 or 2 matching indices
      const matchesCount = Math.random() < 0.15 ? 2 : 1;
      const matchIndices = new Set<number>();
      while (matchIndices.size < matchesCount) {
        matchIndices.add(Math.floor(Math.random() * 6));
      }

      for (let i = 0; i < 6; i++) {
        const prize = getPrize();
        if (matchIndices.has(i)) {
          // Matches one of the winning numbers
          const num = winningNumbers[Math.floor(Math.random() * winningNumbers.length)];
          playerCards.push({ number: num, prize, isWinning: true });
        } else {
          // Generate a non-matching number
          let num = 0;
          do {
            num = Math.floor(Math.random() * 89) + 10;
          } while (winningNumbers.includes(num) || playerCards.some((c) => c.number === num));
          playerCards.push({ number: num, prize, isWinning: false });
        }
      }
    } else {
      // No matches
      for (let i = 0; i < 6; i++) {
        let num = 0;
        do {
          num = Math.floor(Math.random() * 89) + 10;
        } while (winningNumbers.includes(num) || playerCards.some((c) => c.number === num));
        playerCards.push({ number: num, prize: getPrize(), isWinning: false });
      }
    }

    return { winningNumbers, playerCards };
  };

  const generateExtremeCard = (): ExtremeCardState => {
    const isWin = Math.random() < 0.28; // 28% win rate
    
    // Weighted multipliers
    const multRoll = Math.random();
    let multiplier = 1;
    if (multRoll > 0.97) multiplier = 10;
    else if (multRoll > 0.9) multiplier = 5;
    else if (multRoll > 0.7) multiplier = 2;

    const boxes: { prize: number; isWinning: boolean }[] = Array(16).fill(null);

    const getPrize = () => {
      const roll = Math.random();
      if (roll > 0.99) return 5000;
      if (roll > 0.95) return 500;
      if (roll > 0.85) return 100;
      if (roll > 0.6) return 50;
      if (roll > 0.3) return 20;
      return 10;
    };

    if (isWin) {
      // Pick 1 to 4 boxes to have a cash prize
      const winsCount = Math.floor(Math.random() * 4) + 1;
      const winIndices = new Set<number>();
      while (winIndices.size < winsCount) {
        winIndices.add(Math.floor(Math.random() * 16));
      }

      for (let i = 0; i < 16; i++) {
        if (winIndices.has(i)) {
          boxes[i] = { prize: getPrize(), isWinning: true };
        } else {
          boxes[i] = { prize: 0, isWinning: false };
        }
      }
    } else {
      // All boxes are empty
      for (let i = 0; i < 16; i++) {
        boxes[i] = { prize: 0, isWinning: false };
      }
    }

    return { multiplier, boxes };
  };

  // --- SCRATCH COMPLETION LOGIC ---

  const handleScratchComplete = () => {
    if (gameState !== "playing") return;
    setGameState("revealing");

    // Calculate payouts
    let totalWin = 0;
    if (cardState?.type === "classic") {
      // Check for three matching amounts
      const amounts = cardState.data.fields.map((f) => f.amount);
      const counts = amounts.reduce((acc, val) => {
        acc[val] = (acc[val] || 0) + 1;
        return acc;
      }, {} as Record<number, number>);

      const matchAmt = Object.keys(counts).find((k) => counts[Number(k)] >= 3);
      if (matchAmt) {
        totalWin = Number(matchAmt);
        // Mark fields as winning explicitly to animate them
        cardState.data.fields.forEach((f) => {
          if (f.amount === totalWin) f.isWinning = true;
        });
      }
    } else if (cardState?.type === "gold") {
      // Check matching numbers
      cardState.data.playerCards.forEach((box) => {
        if (cardState.data.winningNumbers.includes(box.number)) {
          box.isWinning = true;
          totalWin += box.prize;
        }
      });
    } else if (cardState?.type === "extreme") {
      // Sum prizes * multiplier
      let sum = 0;
      cardState.data.boxes.forEach((box) => {
        if (box.prize > 0) {
          box.isWinning = true;
          sum += box.prize;
        }
      });
      totalWin = sum * cardState.data.multiplier;
    }

    setPayout(totalWin);

    // Update user balance if there's a payout
    if (totalWin > 0) {
      setBalance((prev) => prev + totalWin);
    }

    // Trigger visual/sound feedback
    setTimeout(() => {
      if (totalWin > 0) {
        audio.playWinSound(totalWin >= activeCard!.cost * 2);
      } else {
        audio.playLoseSound();
      }
      setShowResultModal(true);
      setGameState("complete");
    }, 800);
  };

  const handleScratchAll = () => {
    setIsCanvasRevealed(true);
  };

  const handleCloseModal = () => {
    setShowResultModal(false);
    setGameState("lobby");
    setActiveCard(null);
    setCardState(null);
  };

  return (
    <div className={styles.container}>
      {/* HEADER SECTION */}
      <div className={styles.header}>
        <h1 className={styles.title}>Interaktywne Zdrapki</h1>
        <p className={styles.subtitle}>
          Kup kartę, zdrap folię i zgarnij wielkie wygrane w EduKasyno!
        </p>
      </div>

      {/* LOBBY VIEW */}
      {gameState === "lobby" && (
        <div className={styles.grid}>
          {CARDS_LOBBY.map((card) => {
            const canAfford = balance >= card.cost;
            return (
              <div
                key={card.id}
                className={`${styles.choiceCard} ${card.tierClass}`}
              >
                <div className={`${styles.tierTag} ${card.tagClass}`}>
                  {card.tag}
                </div>
                <div className={styles.cardIcon}>{card.icon}</div>
                <h3 className={styles.cardName}>{card.name}</h3>
                <p className={styles.cardDesc}>{card.desc}</p>
                <div className={styles.costSection}>
                  <span>{card.cost}</span>
                  <img src="zeton-maly.svg" alt="Żeton" className={styles.tokenIcon} />
                </div>
                <button
                  className={styles.playButton}
                  onClick={() => handleBuyCard(card)}
                  disabled={!canAfford}
                >
                  {canAfford ? "Kup Zdrapkę" : "Brak Środków"}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* GAMEPLAY VIEW */}
      {activeCard && cardState && (gameState === "playing" || gameState === "revealing" || gameState === "complete") && (
        <div className={styles.gameArea}>
          {/* Scratch Card Frame Wrapper */}
          <ScratchCard
            width={activeCard.width}
            height={activeCard.height}
            theme={activeCard.id}
            isRevealed={isCanvasRevealed}
            onComplete={handleScratchComplete}
          >
            {/* UNDERLYING CONTENTS RENDERED DYNAMICALLY BASED ON CARD TYPE */}

            {cardState.type === "classic" && (
              <div className={styles.classicInnerGrid}>
                {cardState.data.fields.map((field, idx) => (
                  <div
                    key={idx}
                    className={`${styles.classicScratchField} ${
                      field.isWinning && (gameState === "complete" || gameState === "revealing")
                        ? styles.winning
                        : ""
                    }`}
                  >
                    <div className={styles.fieldAmount}>
                      {field.amount}
                      <img src="zeton-maly.svg" alt="Żetony" style={{ width: "14px" }} />
                    </div>
                    <div className={styles.fieldLabel}>Żetonów</div>
                  </div>
                ))}
              </div>
            )}

            {cardState.type === "gold" && (
              <div className={styles.goldInnerContainer}>
                {/* Winning Numbers Header */}
                <div className={styles.goldWinningSection}>
                  <div className={styles.goldWinLabel}>Wygrane Liczby</div>
                  <div className={styles.goldWinNumbers}>
                    {cardState.data.winningNumbers.map((num, idx) => (
                      <div key={idx} className={styles.goldWinNumberBox}>
                        {num}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Player Numbers Grid */}
                <div className={styles.goldPlayerSection}>
                  {cardState.data.playerCards.map((card, idx) => (
                    <div
                      key={idx}
                      className={`${styles.goldPlayerBox} ${
                        card.isWinning && (gameState === "complete" || gameState === "revealing")
                          ? styles.winning
                          : ""
                      }`}
                    >
                      <div className={styles.goldNumber}>{card.number}</div>
                      <div className={styles.goldPrize}>
                        {card.prize}
                        <img src="zeton-maly.svg" alt="Żetony" style={{ width: "10px" }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {cardState.type === "extreme" && (
              <div className={styles.extremeInnerContainer}>
                <div className={styles.extremeTopSection}>
                  <span className={styles.extremeMultLabel}>Szansa na Jackpot</span>
                  <div className={styles.extremeMultiplierBox}>
                    <span className={styles.extremeMultLabel}>Mnożnik:</span>
                    <span className={styles.extremeMultValue}>
                      x{cardState.data.multiplier}
                    </span>
                  </div>
                </div>

                <div className={styles.extremeGrid}>
                  {cardState.data.boxes.map((box, idx) => (
                    <div
                      key={idx}
                      className={`${styles.extremeBox} ${
                        box.prize > 0
                          ? styles.winning
                          : styles.empty
                      }`}
                    >
                      {box.prize > 0 ? (
                        <>
                          <div className={styles.extremeBoxValue}>
                            +{box.prize}
                            <img src="zeton-maly.svg" alt="Żetony" style={{ width: "8px" }} />
                          </div>
                          <div className={styles.extremeBoxIcon}>💎</div>
                        </>
                      ) : (
                        <div style={{ fontSize: "10px", color: "rgba(255, 0, 127, 0.4)", fontWeight: 700 }}>
                          X
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </ScratchCard>

          {/* GAME CONTROLS */}
          <div className={styles.gameControls}>
            <button
              className={styles.actionButton}
              onClick={() => {
                setGameState("lobby");
                setActiveCard(null);
                setCardState(null);
              }}
              disabled={gameState === "revealing"}
            >
              ⬅ Powrót do Lobby
            </button>

            <button
              className={`${styles.actionButton} ${styles.scratchAllBtn}`}
              onClick={handleScratchAll}
              disabled={gameState !== "playing" || isCanvasRevealed}
            >
              ✨ Odsłoń Wszystko
            </button>
          </div>
        </div>
      )}

      {/* POPUP RESULTS MODAL */}
      {showResultModal && activeCard && (
        <div className={styles.modal}>
          <div
            className={`${styles.modalContent} ${
              activeCard.id === "classic"
                ? styles.modalThemeClassic
                : activeCard.id === "gold"
                ? styles.modalThemeGold
                : styles.modalThemeExtreme
            }`}
          >
            {payout > 0 ? (
              <>
                <div className={styles.modalIcon}>🎉</div>
                <h2 className={`${styles.modalTitle} styles.modalTitleWin`}>Gratulacje!</h2>
                <div className={styles.modalPayout}>
                  <span>+{payout}</span>
                  <img src="zeton-maly.svg" alt="Żetony" style={{ width: "28px" }} />
                </div>
                <p className={styles.modalText}>
                  Zdrapka okazała się szczęśliwa! Twoja nagroda w wysokości {payout} żetonów
                  została dodana do Twojego salda.
                </p>
              </>
            ) : (
              <>
                <div className={styles.modalIcon}>😢</div>
                <h2 className={`${styles.modalTitle} styles.modalTitleLose`}>Spróbuj Ponownie</h2>
                <p className={styles.modalText} style={{ marginTop: "18px" }}>
                  Tym razem się nie udało. Nie poddawaj się! Każda kolejna zdrapka to nowa
                  szansa na rozbicie banku.
                </p>
              </>
            )}
            <button className={styles.modalButton} onClick={handleCloseModal}>
              Zagraj Ponownie
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Scratch;