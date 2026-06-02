import { Link } from "react-router-dom";
import { useBalance } from "../context/BalanceContext";
import styles from "./Navbar.module.css";
import { formatBalance } from "../utils/format.ts";

export const Navbar = () => {
  const { balance } = useBalance();

  return (
    <nav className={styles.navbar}>
      <div className={styles.navContainer}>
        {/* LOGO / NAZWA KASYNA */}
        <Link to="/" className={styles.logo}>
          EduKasyno
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
            Mój Profil
          </Link>
        </div>

        <div className={styles.balanceSection}>
          <span className={styles.balanceLabel}>SALDO:</span>

          <span
            title={`Dokładne saldo: ${balance}`}
            className={styles.balanceValue}
          >
            {formatBalance(balance)}
            <img
              src="zeton-portfel.svg"
              alt="Żetony"
              className={styles.tokenIcon}
            />
          </span>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;