import { useEffect, useState } from "react";
import { useBalance } from "../context/BalanceContext";
import styles from "./Profile.module.css"; // Musisz stworzyć ten plik CSS

interface GraHistoryczna {
  id: number;
  nazwa_gry: "Zdrapki" | "Ruletka" | "Sloty";
  wynik: number;
}

interface ProfilData {
  login: string;
  statystyki: {
    lacznieGier: number;
    sumaWygranych: number;
  };
  historia: GraHistoryczna[];
}

export const Profile = () => {
  const { balance } = useBalance(); // Pobieramy aktualne saldo z Twojego kontekstu
  const [profileData, setProfileData] = useState<ProfilData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Pobieramy statystyki i historię z backendu
    fetch("http://localhost:3001/api/profile")
      .then((res) => {
        if (!res.ok) throw new Error("Nie udało się pobrać danych profilu");
        return res.json();
      })
      .then((data) => {
        setProfileData(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className={styles.centered}>Ładowanie profilu gracza...</div>;
  if (error) return <div className={`${styles.centered} ${styles.error}`}>{error}</div>;
  if (!profileData) return null;

  return (
    <div className={styles.profileContainer}>
      {/* NAGŁÓWEK PROFILU */}
      <div className={styles.profileHeader}>
        <div className={styles.avatar}>🎰</div>
        <div>
          <h1 className={styles.username}>{profileData.login}</h1>
          <p className={styles.userRole}>Ranga: Edu-Gracz</p>
        </div>
      </div>

      {/* KARTY Z PODSUMOWANIEM STANTA KONTA I STATYSTYK */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <h3>Aktualne Saldo</h3>
          <div className={styles.statValue}>
            {balance} <img src="zeton-portfel.svg" alt="Żetony" className={styles.tokenIcon} />
          </div>
          <p className={styles.statDesc}>Środki dostępne do gry</p>
        </div>

        <div className={styles.statCard}>
          <h3>Rozegrane Gry</h3>
          <div className={styles.statValue}>{profileData.statystyki.lacznieGier}</div>
          <p className={styles.statDesc}>Łączna liczba podejść</p>
        </div>

        <div className={styles.statCard}>
          <h3>Suma Wygranych</h3>
          <div className={styles.statValue} style={{ color: "#2ecc71" }}>
            +{profileData.statystyki.sumaWygranych}
          </div>
          <p className={styles.statDesc}>Zysk ze wszystkich gier</p>
        </div>
      </div>

      {/* TABELA Z HISTORIĄ GIER */}
      <div className={styles.historySection}>
        <h2>Ostatnia aktywność</h2>
        {profileData.historia.length === 0 ? (
          <p className={styles.emptyHistory}>Nie rozegrałeś jeszcze żadnej gry. Czas to zmienić w lobby!</p>
        ) : (
          <div className={styles.tableWrapper}>
            <table className={styles.historyTable}>
              <thead>
                <tr>
                  <th>ID Gry</th>
                  <th>Gra</th>
                  <th>Wynik (Żetony)</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {profileData.historia.map((gra) => {
                  const isWin = gra.wynik > 0;
                  return (
                    <tr key={gra.id}>
                      <td>#{gra.id}</td>
                      <td>
                        <strong>{gra.nazwa_gry}</strong>
                      </td>
                      <td className={isWin ? styles.winText : styles.loseText}>
                        {isWin ? `+${gra.wynik}` : gra.wynik}
                      </td>
                      <td>
                        <span className={`${styles.badge} ${isWin ? styles.badgeWin : styles.badgeLose}`}>
                          {isWin ? "Wygrana" : "Przegrana/Kupno"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;