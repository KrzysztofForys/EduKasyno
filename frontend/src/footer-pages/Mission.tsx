import React from "react";
import styles from "./Mission.module.css";

export const Mission: React.FC = () => {
  return (
    <div className={styles.missionPage}>

      {/* Główny blok: Misja */}
      <section className={styles.heroSection}>
        <div className={styles.heroContent}>
          <span className={styles.badge}>Nasza Misja</span>
          <h1 className={styles.title}>
            Rozbijamy <span>Monotonię</span> Edukacji
          </h1>
          <p className={styles.description}>
            Tradycyjne metody nauczania często przegrywają z algorytmami social mediów,
            które walczą o uwagę naszą i naszych mózgów. Nasza misja jest prosta:
            zamiast walczyć z mechanizmami dopaminowymi, postanowiliśmy zaprząc je do nauki.
          </p>
          <p className={styles.description}>
            Tworzymy środowisko, w którym dreszczyk emocji towarzyszący grze aktywuje
            skupienie, a nagrodą za podjęte ryzyko jest trwała wiedza i realny rozwój.
          </p>
        </div>

        {/* Wizualny "Neonowy Akcelerator" po prawej */}
        <div className={styles.heroVisual}>
          <div className={styles.coreOrb}>
            <span className={styles.orbIcon}>⚡</span>
            <div className={styles.orbPulse}></div>
          </div>
        </div>
      </section>

      {/* Trzy filary naszej misji */}
      <section className={styles.pillarsSection}>
        <h2 className={styles.sectionTitle}>Filary EduKasyna</h2>

        <div className={styles.pillarsGrid}>

          <div className={styles.pillarCard}>
            <div className={`${styles.pillarLine} ${styles.lineCyjan}`}></div>
            <span className={styles.pillarNumber}>01</span>
            <h3>Zdrowa Dopamina</h3>
            <p>Transformujemy mechanizm nagrody. Zamiast pustych polubień, Twój mózg dostaje strzał dopaminy za rozwiązanie trudnego równania lub zapamiętanie faktu.</p>
          </div>

          <div className={styles.pillarCard}>
            <div className={`${styles.pillarLine} ${styles.lineGold}`}></div>
            <span className={styles.pillarNumber}>02</span>
            <h3>Grywalizacja Premium</h3>
            <p>Koniec z nudnymi quizami z lat 2000. Wprowadzamy jakość wizualną i UX rodem z najlepszych gier AAA oraz dynamicznych kasyn, by nauka była hipnotyzująca.</p>
          </div>

          <div className={styles.pillarCard}>
            <div className={`${styles.pillarLine} ${styles.linePurple}`}></div>
            <span className={styles.pillarNumber}>03</span>
            <h3>Dostępność i Bezpieczeństwo</h3>
            <p>Pokazujemy mechanizmy ryzyka w 100% bezpiecznym, darmowym i kontrolowanym środowisku. Edukujemy o statystyce poprzez praktyczną, bezstresową zabawę.</p>
          </div>

        </div>
      </section>

    </div>
  );
};