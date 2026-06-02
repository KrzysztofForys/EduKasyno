import { useState } from "react";
import { useBalance } from "../context/BalanceContext.tsx";
import { BetLayout } from "../components/BetLayout.tsx";
import { SlotReel } from "../components/SlotReel.tsx";
import styles from "./Slots.module.css";

export default function Slots() {
  const { balance, refreshBalance, tryToChangeBalance } = useBalance();
  const [spinning, setSpinning] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [bet, setBet] = useState<number>(100);
  const [winAmount, setWinAmount] = useState<number>(0);

  // Domyślne symbole startowe przed pierwszym kliknięciem
  const [serverSymbols, setServerSymbols] = useState<string[]>(["cytryna", "cytryna", "cytryna"]);
  const [serverMessage, setServerMessage] = useState<string | null>(null);

  const handleSpin = async () => {
    if (bet <= 0) {
      alert("Ustaw zakład większy niż 0!");
      return;
    }
    if (balance < bet) {
      alert("Niewystarczające środki na koncie!");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      alert("Błąd autoryzacji. Zaloguj się ponownie.");
      return;
    }

    try {
      const response = await fetch("http://localhost:3001/api/games/slots/play", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ bet })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        alert(data.error || "Wystąpił błąd podczas gry.");
        return;
      }

      // 1. Od razu odejmij zakład z licznika, żeby było widać, że gra ruszyła
      tryToChangeBalance(-bet);

      // 2. Wpisz symbole z bazy, resetując stary komunikat
      setServerSymbols(data.symbols);
      setWinAmount(data.winAmount);
      setServerMessage(data.message);
      setMessage(null);

      // 3. Odpal kręcenie Twojej taśmy
      setSpinning(true);

    } catch (err) {
      console.error("Błąd połączenia ze slotami:", err);
      alert("Błąd połączenia z serwerem kasyna.");
    }
  };

  const handleStop = (index: number) => {
    // Jeżeli zatrzymał się trzeci (ostatni) bębenek
    if (index === 2) {
      setSpinning(false);

      // HAJS I MODAL DODAJĄ SIĘ Z TIMEOUTEM (pół sekundy po pełnym wyhamowaniu maszyny)
      setTimeout(() => {
        refreshBalance(); // Strzał do bazy po świeże saldo z wygraną
        setMessage(serverMessage); // Pokazanie modala
      }, 500);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.headerLayout}>
        <h1 className={styles.title}>Sloty</h1>
        <p className={styles.subtitle}>Wybierz zakład i zakręć bębnami!</p>
      </div>
      <div className={styles.slotMachine}>
        {/* Przekazujemy wylosowane z serwera znaki do odpowiednich bębnów */}
        <SlotReel spinning={spinning} stopDelay={0} targetSymbol={serverSymbols[0]} onStop={() => handleStop(0)} />
        <SlotReel spinning={spinning} stopDelay={300} targetSymbol={serverSymbols[1]} onStop={() => handleStop(1)} />
        <SlotReel spinning={spinning} stopDelay={600} targetSymbol={serverSymbols[2]} onStop={() => handleStop(2)} />
      </div>
      <div className={styles.betContainer}>
        <BetLayout bet={bet} setBet={setBet} />
      </div>


      <button onClick={handleSpin} disabled={spinning} className={styles.slotsBtn}>
        {spinning ? "Losuję..." : "Zakręć"}
      </button>

      {message && (
        <div className="modal">
          <div className="modal-content">
            <h2>{message}</h2>
            {winAmount > 0 && (
              <div className={styles.modalWinBody}>
                <div>Wygrana: +{winAmount}</div><img src="zeton-portfel.svg" className={styles.modalWinBodyImg} />
              </div>
            )}
            <button onClick={() => setMessage(null)} className="modal-close-btn">
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
}