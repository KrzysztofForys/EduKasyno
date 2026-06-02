import { Link } from "react-router-dom";
import { useBalance } from "../context/BalanceContext";
import styles from "./Navbar.module.css";

export const Navbar = () => {
  const { balance } = useBalance();

  // Funkcja skracająca saldo (np. 1500 -> 1.5K, 2000000 -> 2M)
  const formatBalance = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1).replace(/\.0$/, "") + "M";
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1).replace(/\.0$/, "") + "K";
    }
    return num.toString();
  };

  return (
    <nav className={styles.navbar}>
      <div className={styles.navContainer}>
        {/* LOGO / NAZWA KASYNA */}
        <Link to="/" className={styles.logo}>
          🎰 EduKasyno
        </Link>

        {/* LINKI NAWIGACYJNE */}
        <div className={styles.navLinks}>
          <Link to="/" className={styles.navLink}>
            Główna
          </Link>
          <Link to="/sloty" className={styles.navLink}>
            Sloty
          </Link>
          <Link to="/ruletka" className={styles.navLink}>
            Ruletka
          </Link>
          <Link to="/zdrapki" className={styles.navLink}>
            Zdrapki
          </Link>
          <Link to="/profil" className={`${styles.navLink} ${styles.profileLink}`}>
            👤 Mój Profil
          </Link>
        </div>

        {/* SEKCJA SALDA W NAVBARZE (SKRÓCONE) */}
        <div className={styles.balanceSection}>
          <span className={styles.balanceLabel}>Saldo:</span>
          <div className={styles.balanceValue}>
            <span title={`Dokładne saldo: ${balance}`}>{formatBalance(balance)}</span>
            <img src="zeton-portfel.svg" alt="Żetony" className={styles.tokenIcon} />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;