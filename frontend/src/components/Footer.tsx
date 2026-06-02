import React from "react";
import { Link } from "react-router-dom";
import styles from "./Footer.module.css"; // Link do stylów poniżej

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={styles.footerContainer}>

        {/* Kolumna Brandowa */}
        <div className={styles.footerBrand}>
          <h3 className={styles.footerLogo}>EDU<span>KASYNO</span></h3>
          <p className={styles.footerDescription}>
            Graj, ucz się i wygrywaj wiedzę w najbardziej elektryzującym kasynie edukacyjnym.
          </p>
        </div>

        {/* Kolumna 1 */}
        <div className={styles.footerColumn}>
          <h4>O nas</h4>
          <ul>
            <li><Link to="/o-nas" className={styles.footerLink}>O nas</Link></li>
            <li><Link to="/misja" className={styles.footerLink}>Nasza misja</Link></li>
            <li><Link to="/zespol" className={styles.footerLink}>Zespół</Link></li>
          </ul>
        </div>

        {/* Kolumna 2 */}
        <div className={styles.footerColumn}>
          <h4>Zasady gry</h4>
          <ul>
            <li><Link to="/odpowiedzialna-gra" className={styles.footerLink}>Odpowiedzialna gra</Link></li>
            <li><Link to="/regulamin" className={styles.footerLink}>Regulamin</Link></li>
            <li><Link to="/prywatnosc" className={styles.footerLink}>Polityka prywatności</Link></li>
          </ul>
        </div>

        {/* Kolumna 3 */}
        <div className={styles.footerColumn}>
          <h4>Wsparcie</h4>
          <ul>
            <li><Link to="/pomoc" className={styles.footerLink}>Centrum Pomocy</Link></li>
            <li><Link to="/kontakt" className={styles.footerLink}>Kontakt</Link></li>
            <li><Link to="/faq" className={styles.footerLink}>FAQ</Link></li>
          </ul>
        </div>

      </div>

      {/* Dolny pasek z prawami i info */}
      <div className={styles.footerBottom}>
        <p>&copy; {currentYear} EduKasyno. Wszelkie prawa zastrzeżone.</p>
        <div className={styles.footerBadge}>Edukacja & Rozrywka</div>
      </div>
    </footer>
  );
};