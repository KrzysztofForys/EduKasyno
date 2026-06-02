import React from "react";
import styles from "./About.module.css";

export const About: React.FC = () => {
  return (
    <div className={styles.aboutPage}>
      {/* Sekcja Hero */}
      <section className={styles.aboutHero}>
        <h1 className={styles.aboutTitle}>
          Witaj w <span>EduKasyno</span>
        </h1>
        <p className={styles.aboutSubtitle}>
          Gdzie dreszczyk emocji spotyka potęgę nauki. Przeprojektowaliśmy rozrywkę,
          aby każda stawka podnosiła Twoje IQ.
        </p>
      </section>

      {/* Bento Grid / Siatka Funkcji */}
      <section className={styles.aboutGrid}>
        <div className={`${styles.aboutCard} ${styles.cardGlowCyan}`}>
          <div className={styles.cardIcon}>🧠</div>
          <h3>Hazard? Nie, Edukacja!</h3>
          <p>
            Wykorzystujemy mechaniki gier losowych, aby drastycznie zwiększyć zaangażowanie
            i przyswajanie wiedzy. Zamiast nudnych testów – pełna adrenaliny rozgrywka.
          </p>
        </div>

        <div className={`${styles.aboutCard} ${styles.cardGlowGold}`}>
          <div className={styles.cardIcon}>💰</div>
          <h3>Wygrywasz Wiedzę</h3>
          <p>
            W naszym kasynie żetony odzwierciedlają Twój postęp naukowy. Ryzykujesz żetony,
            odpowiadasz na pytania i rozbijasz bank swoją inteligencją.
          </p>
        </div>

        <div className={`${styles.aboutCard} ${styles.cardGlowPurple}`}>
          <div className={styles.cardIcon}>🚀</div>
          <h3>Dla kogo jesteśmy?</h3>
          <p>
            Dla uczniów, studentów i pasjonatów, którzy mają dość monotonii. Udowadniamy,
            że nauka może wywoływać gęsią skórkę i zdrowe, gamingowe emocje.
          </p>
        </div>

      </section>

      {/* Sekcja Liczby / Statystyki */}
      <section className={styles.aboutStats}>
        <div className={styles.statItem}>
          <span className={styles.statNumber}>100%</span>
          <span className={styles.statLabel}>Bezpiecznej Rozrywki</span>
        </div>
        <div className={styles.statItem}>
          <span className={styles.statNumber}>0 zł</span>
          <span className={styles.statLabel}>Prawdziwych Pieniędzy</span>
        </div>
        <div className={styles.statItem}>
          <span className={styles.statNumber}>24/7</span>
          <span className={styles.statLabel}>Treningu Mózgu</span>
        </div>
      </section>
    </div>
  );
};