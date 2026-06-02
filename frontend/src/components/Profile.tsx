import React, { useEffect, useState } from "react";
import { useBalance } from "../context/BalanceContext";

interface ProfileData {
  id: number;
  login: string;
  saldo: number;
  lacznieGier: number;
  wygraneGier: number;
  sumaWygranych: number;
}

interface HistoryItem {
  nazwa_gry: string;
  wynik: number;
  data_gry: string;
}

export const Profile: React.FC = () => {
  const { balance, refreshBalance } = useBalance(); // Pobieramy z kontekstu funkcję odświeżania salda
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isResetting, setIsResetting] = useState<boolean>(false);

  const fetchProfileData = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("Brak tokenu autoryzacji w localStorage. Zaloguj się ponownie.");
      setLoading(false);
      return;
    }

    try {
      const profileRes = await fetch("http://localhost:3001/api/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const historyRes = await fetch("http://localhost:3001/api/profile/history", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (profileRes.ok && historyRes.ok) {
        const profileData = await profileRes.json();
        const historyData = await historyRes.json();
        setProfile(profileData);
        setHistory(historyData);
        setError(null);
      } else {
        setError("Nie udało się pobrać danych z profilu.");
      }
    } catch (err) {
      console.error(err);
      setError("Błąd połączenia z serwerem bazodanowym.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileData();
  }, [balance]);

  const handleReset = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Brak autoryzacji sesji!");
      return;
    }

    if (!window.confirm("Czy chcesz wyczyścić historię gier i zresetować stan konta do 10000 żetonów?")) {
      return;
    }

    setIsResetting(true);

    try {
      const res = await fetch("http://localhost:3001/api/profile/reset", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      if (res.ok) {
        alert("Konto zresetowane pomyślnie! Przywrócono stan 10000 żetonów.");
        await refreshBalance(); // Wymuszamy natychmiastową aktualizację salda w Navbarze
        await fetchProfileData(); // Przeładowujemy tabelę historii i statystyki użytkownika
      } else {
        alert("Błąd serwera podczas resetu.");
      }
    } catch (err) {
      console.error(err);
      alert("Błąd sieciowy.");
    } finally {
      setIsResetting(false);
    }
  };

  if (loading) return <div style={{ color: "white", padding: "20px" }}>Wczytywanie statystyk...</div>;
  if (error) return <div style={{ color: "red", padding: "20px" }}>{error}</div>;

  return (
    <div style={{ padding: "20px", color: "white", fontFamily: "sans-serif" }}>
      <h1>Profil użytkownika: {profile?.login}</h1>
      
      <div style={{ background: "#1e1e1e", padding: "20px", borderRadius: "8px", marginBottom: "25px" }}>
        <h3>Twoje dane finansowe:</h3>
        <p>🪙 Saldo konta: <strong>{balance} żetonów</strong></p>
        <p>🎮 Wszystkie gry: {profile?.lacznieGier}</p>
        <p>🏆 Trafione wygrane: {profile?.wygraneGier}</p>
        <p>📈 Łączny zysk z wygranych: {profile?.sumaWygranych} żetonów</p>

        <button 
          onClick={handleReset} 
          disabled={isResetting}
          style={{
            backgroundColor: "#e63946",
            color: "white",
            border: "none",
            padding: "12px 24px",
            borderRadius: "5px",
            cursor: "pointer",
            fontWeight: "bold",
            marginTop: "10px"
          }}
        >
          {isResetting ? "Przetwarzanie..." : "🔄 Resetuj finanse (Powrót do 10000 żetonów)"}
        </button>
      </div>

      <div>
        <h3>Ostatnie 10 gier:</h3>
        {history.length === 0 ? (
          <p style={{ color: "#888" }}>Brak rozegranych partii.</p>
        ) : (
          <table style={{ width: "100%", textAlign: "left", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid #555" }}>
                <th style={{ padding: "10px" }}>Gra</th>
                <th style={{ padding: "10px" }}>Kwota końcowa</th>
                <th style={{ padding: "10px" }}>Data rozegrania</th>
              </tr>
            </thead>
            <tbody>
              {history.map((item, index) => (
                <tr key={index} style={{ borderBottom: "1px solid #2a2a2a" }}>
                  <td style={{ padding: "10px" }}>{item.nazwa_gry}</td>
                  <td style={{ padding: "10px", color: item.wynik > 0 ? "#4caf50" : "#f44336" }}>
                    {item.wynik > 0 ? `+${item.wynik}` : item.wynik} żetonów
                  </td>
                  <td style={{ padding: "10px", color: "#888" }}>
                    {new Date(item.data_gry).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};