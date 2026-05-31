import { useState } from "react";
import { useBalance } from "../context/BalanceContext.tsx"
import { BetLayout } from "../components/BetLayout.tsx"
import { SlotReel } from "../components/SlotReel.tsx";


export default function Slots() {
  const { balance, tryToChangeBalance } = useBalance()
  const [spinning, setSpinning] = useState(false);
  const [results, setResults] = useState<string[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [bet, setBet] = useState<number>(100);
  const [winAmount, setWinAmount] = useState<number>(0);

  const SYMBOL_MULTIPLIERS: Record<string, number> = {
    "czeresnia": 1,
    "cytryna": 1.5,
    "arbuz": 2,
    "pomarancza": 2,
    "winogrono": 3,
    "bar": 5,
    "siedem": 10 // Najtrudniejszy do zdobycia zysk
  };

  const handleSpin = () => {
    if (bet <= 0) {
      alert("Ustaw zakład większy niż 0!");
      return;
    }
    if (balance < bet) {
      alert("Niewystarczające środki na koncie!");
      return;
    }

    // Deduct bet from balance
    if (tryToChangeBalance(-bet)) {
      setResults([]);
      setSpinning(true);
      setWinAmount(0);
    }
  }
  const handleStop = (symbol: string) => {
    setResults((prev) => {
      const updated = [...prev, symbol];

      if (updated.length === 3) {
        setSpinning(false);

        setTimeout(() => {
          const [s1, s2, s3] = updated;

          // 1. JACKPOT (3 takie same) -> Mnożnik bazowy symbolu x 5
          if (s1 === s2 && s2 === s3) {
            const mult = SYMBOL_MULTIPLIERS[s1] * 5;
            setWinAmount(bet * mult);
            setMessage(`SUPER JACKPOT x${mult}!`);
            tryToChangeBalance(bet * mult);
          }
          // 2. MAŁA WYGRANA (2 takie same) -> Wypłacamy ułamek wartości symbolu, np. 40% wartości
          else if (s1 === s2 || s1 === s3) {
            // s1 jest parą
            const mult = Math.max(0.5, SYMBOL_MULTIPLIERS[s1] * 0.6);
            setWinAmount(Math.floor(bet * mult));
            setMessage(`Para! Wygrana x${mult.toFixed(1)}`);
            tryToChangeBalance(Math.floor(bet * mult));
          }
          else if (s2 === s3) {
            // s2 jest parą
            const mult = Math.max(0.5, SYMBOL_MULTIPLIERS[s2] * 0.6);
            setWinAmount(Math.floor(bet * mult));
            setMessage(`Para! Wygrana x${mult.toFixed(1)}`);
            tryToChangeBalance(Math.floor(bet * mult));
          }
          // 3. PRZEGRANA
          else {
            setMessage("Spróbuj ponownie.");
          }
        }, 500);
      }

      return updated;
    });
  };

  return (
    <div className="slots-container">
      <div className="slot-machine">
        <SlotReel spinning={spinning} stopDelay={0} onStop={handleStop} />
        <SlotReel spinning={spinning} stopDelay={300} onStop={handleStop} />
        <SlotReel spinning={spinning} stopDelay={600} onStop={handleStop} />
      </div>
      <BetLayout bet={bet} setBet={setBet} />
      <button onClick={handleSpin} disabled={spinning} className="slots-btn">
        Zakręć
      </button>

      {message && (
        <div className="modal">
          <div className="modal-content">
            <h2>{message}</h2>
            <p className="modal-message">
              Wylosowane symbole:
            </p>
            <p>
              {results.join(" | ")}
            </p>
            {winAmount > 0 && <p>Wygrana: {winAmount} &#x1FA99;</p>}
            <button onClick={() => setMessage(null)} className="modal-close-btn">
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
}