import { useState, type Dispatch, type SetStateAction } from "react";
import { Reel } from "../components/Reel";
type SlotsProps = {
  balance: number,
  setBalance: Dispatch<SetStateAction<number>>
}
export default function Slots({balance, setBalance}: SlotsProps) {
  const [spinning, setSpinning] = useState(false);
  const [results, setResults] = useState<string[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [bet, setBet] = useState<number>(0);

  const handleSpin = () => {
    setResults([]);
    setSpinning(true);
  };

const handleStop = (symbol: string) => {
  setResults(prev => {
    const updated = [...prev, symbol];

    if (updated.length === 3) {
      setSpinning(false);
      setTimeout(() => {
      if (updated[0] === updated[1] && updated[1] === updated[2]) {
        setMessage("JACKPOT!");
      } else if (updated[0] === updated[1] || updated[1] === updated[2] || updated[0] === updated[2]) {
        setMessage("Mała wygrana!");
      } else {
        setMessage("Spróbuj ponownie.");
      }
      },500)
    }

    return updated;
  });
};

  return (
    <div>
      <div className="slot-machine" style={{ display: "flex", gap: "10px" }}>
        <Reel spinning={spinning} stopDelay={0} onStop={handleStop} />
        <Reel spinning={spinning} stopDelay={300} onStop={handleStop} />
        <Reel spinning={spinning} stopDelay={600} onStop={handleStop} />
      </div>

      <input type="number" name="bet" placeholder="kwota" step={100} value={bet} onChange={(event) => setBet(Number(event.target.value))}/><br/>
      <button onClick={handleSpin} disabled={spinning}>
        Zakręć bębnami
      </button>

      {message && (
        <div className="modal">
          <div className="modal-content">
            <h2>{message}</h2>
            Aktualny stan konta: {balance} &#x1FA99;
            <button onClick={() => setMessage(null)}>OK</button>
          </div>
        </div>
      )}
    </div>
    
    
  );
}