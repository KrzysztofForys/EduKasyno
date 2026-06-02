import React, { useEffect, useState } from "react";
import { useBalance } from "../context/BalanceContext";
import styles from "./Profile.module.css";

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
  const { balance, refreshBalance } = useBalance();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isResetting, setIsResetting] = useState<boolean>(false);
  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login"; // <--- Czysty JS, przekieruje bez użycia navigate
  };

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

    if (
      !window.confirm(
        "Czy chcesz wyczyścić historię gier i zresetować stan konta do 10000 żetonów?"
      )
    ) {
      return;
    }

    setIsResetting(true);

    try {
      const res = await fetch("http://localhost:3001/api/profile/reset", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (res.ok) {
        alert(
          "Konto zresetowane pomyślnie! Przywrócono stan 10000 żetonów."
        );

        await refreshBalance();
        await fetchProfileData();
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

  if (loading) {
    return (
      <div className={styles.loadingState}>
        Wczytywanie statystyk...
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorState}>
        {error}
        <button
          onClick={handleLogout}
          className="logout-btn"
          style={{
            padding: "8px 16px",
            backgroundColor: "#f44336",
            color: "#fff",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontWeight: "bold"
          }}
        >
          Wyloguj się
        </button>
      </div>
    );
  }

  return (
    <div className={styles.profilePage}>
      <h1>Profil użytkownika: {profile?.login}</h1>

      <div className={styles.financeCard}>
        <div className={styles.profileInfoWithToken}>
          <div>
            Saldo konta: <strong>{balance}</strong>
          </div>
          <img
            src="/zeton-portfel.svg"
            alt="Żetony"
            className={styles.profileInfoWithTokenImg}
          />
        </div>

        <p>Wszystkie gry: {profile?.lacznieGier}</p>

        <p>Trafione wygrane: {profile?.wygraneGier}</p>

        <div className={styles.profileInfoWithToken}>
          <div>Suma wygranych: {profile?.sumaWygranych}</div>
          <img
            src="/zeton-portfel.svg"
            alt="Żetony"
            className={styles.profileInfoWithTokenImg}
          />
        </div>
        <div style={{ display: "inline-flex", gap: "10px" }}>
          <button
            onClick={handleReset}
            disabled={isResetting}
            className={styles.resetButton}
          >
            {isResetting
              ? "Przetwarzanie..."
              : "Resetuj saldo do 10k"}
          </button>
          <button
            onClick={handleLogout}
            className={styles.resetButton}
          >
            Wyloguj się
          </button>
        </div>
      </div>

      <div>
        <h3>Ostatnie 10 gier:</h3>

        {history.length === 0 ? (
          <p className={styles.emptyHistory}>
            Brak rozegranych partii.
          </p>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr className={styles.tableHeaderRow}>
                <th className={styles.tableCell}>Gra</th>
                <th className={styles.tableCell}>Kwota końcowa</th>
                <th className={styles.tableCell}>Data rozegrania</th>
              </tr>
            </thead>

            <tbody>
              {history.map((item, index) => (
                <tr key={index} className={styles.tableRow}>
                  <td className={styles.tableCell}>
                    {item.nazwa_gry}
                  </td>

                  <td
                    className={
                      item.wynik > 0
                        ? styles.winCell
                        : styles.loseCell
                    }
                  >
                    {item.wynik > 0
                      ? `+${item.wynik}`
                      : item.wynik}{" "}
                    żetonów
                  </td>

                  <td className={styles.dateCell}>
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