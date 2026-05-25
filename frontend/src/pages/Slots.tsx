import { useState, type Dispatch, type SetStateAction } from "react";
import { Reel } from "../components/Reel";

type SlotsProps = {
  balance: number;
  setBalance: Dispatch<SetStateAction<number>>;
};

export default function Slots({ balance, setBalance }: SlotsProps) {
  const [spinning, setSpinning] = useState(false);
  const [results, setResults] = useState<string[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [bet, setBet] = useState<number>(0);

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
    setBalance((prev) => prev - bet);
    setResults([]);
    setSpinning(true);
  };

  const handleStop = (symbol: string) => {
    setResults((prev) => {
      const updated = [...prev, symbol];

      if (updated.length === 3) {
        setSpinning(false);
        setTimeout(() => {
          if (updated[0] === updated[1] && updated[1] === updated[2]) {
            setMessage("JACKPOT!");
            setBalance((prev) => prev + bet * 10);
          } else if (
            updated[0] === updated[1] ||
            updated[1] === updated[2] ||
            updated[0] === updated[2]
          ) {
            setMessage("Mała wygrana!");
            setBalance((prev) => prev + bet * 2);
          } else {
            setMessage("Spróbuj ponownie.");
          }
        }, 500);
      }

      return updated;
    });
  };

  return (
    <div className="slots-container">
      <div className="slot-machine" style={{ display: "flex", gap: "10px" }}>
        <Reel spinning={spinning} stopDelay={0} onStop={handleStop} />
        <Reel spinning={spinning} stopDelay={300} onStop={handleStop} />
        <Reel spinning={spinning} stopDelay={600} onStop={handleStop} />
      </div>

      <div className="bet-layout">
        <button
          className="change-bet"
          onClick={() => setBet((prev) => (prev === 0 ? 0 : prev - 100))}
        >
          -
        </button>
        <input
          type="number"
          name="bet"
          placeholder="kwota"
          min={0}
          value={bet}
          onChange={(event) => setBet(Number(event.target.value))}
        />
        <button className="change-bet" onClick={() => setBet((prev) => prev + 100)}>
          +
        </button>
      </div>
      <button onClick={handleSpin} disabled={spinning} className="slots-btn">
        Zakręć
      </button>

      {message && (
        <div className="modal">
          <div className="modal-content">
            <h2>{message}</h2>
            <p style={{ margin: "10px 0", fontSize: "14px", opacity: 0.8 }}>
              Wylosowane symbole: {results.join(" | ")}
            </p>
            Aktualny stan konta: {balance} &#x1FA99;
            <button onClick={() => setMessage(null)} style={{ display: "block", margin: "20px auto 0" }}>
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
}