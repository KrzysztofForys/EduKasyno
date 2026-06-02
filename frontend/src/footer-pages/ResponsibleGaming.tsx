import React from "react";
import styles from "./ResponsibleGaming.module.css";

export const ResponsibleGaming: React.FC = () => {
  return (
    <div className={styles.container}>

      {/* Sekcja Hero */}
      <section className={styles.heroSection}>
        <span className={styles.badge}>Świadoma Rozgrywka</span>
        <h1 className={styles.title}>
          Zrozumieć <span>Matematykę</span> Gry
        </h1>
        <p className={styles.subtitle}>
          W EduKasynie nie ryzykujesz prawdziwych pieniędzy, ale chcemy, abyś zdobył najważniejszą wiedzę:
          jak działają mechanizmy losowe i dlaczego matematyka zawsze stoi po stronie arkusza kalkulacyjnego.
        </p>
      </section>

      {/* Grid: Edukacja o mechanikach */}
      <section className={styles.infoGrid}>

        <div className={`${styles.card} ${styles.cardDanger}`}>
          <div className={styles.cardHeader}>
            <span className={styles.icon}>📉</span>
            <h3>Czym jest House Edge?</h3>
          </div>
          <p>
            To wbudowana w każdą grę przewaga matematyczna kasyna. Nawet jeśli w krótkim terminie rozbijesz bank,
            w długiej perspektywie czasu statystyka gwarantuje, że system odzyska przewagę. W EduKasynie uczymy tej zależności
            na żywych wykresach.
          </p>
        </div>

        <div className={`${styles.card} ${styles.cardPrimary}`}>
          <div className={styles.cardHeader}>
            <span className={styles.icon}>🤖</span>
            <h3>RNG (Generator Liczb Losowych)</h3>
          </div>
          <p>
            Nasze bębny i algorytmy nie mają "pamięci". To, że maszyna nie wypłaciła nagrody przez 10 spinów z rzędu,
            nie oznacza, że w 11. spinie szansa na wygraną rośnie. Każde losowanie to zupełnie nowa, niezależna karta matematyczna.
          </p>
        </div>

        <div className={`${styles.card} ${styles.cardGold}`}>
          <div className={styles.cardHeader}>
            <span className={styles.icon}>🧠</span>
            <h3>Błąd Hazardzisty (Gambler's Fallacy)</h3>
          </div>
          <p>
            To pułapka psychologiczna, w której Twój mózg próbuje dostrzec wzorce w czystym chaosie. Zrozumienie,
            jak emocje wpływają na podejmowanie decyzji pod wpływem dopaminy, to najlepsza tarcza ochronna w realnym świecie.
          </p>
        </div>

      </section>

      {/* Sekcja "Złote Zasady Kontroli" */}
      <section className={styles.rulesSection}>
        <h2 className={styles.sectionTitle}>Twoje Bezpieczne Limity</h2>
        <div className={styles.rulesContainer}>
          <div className={styles.ruleItem}>
            <div className={styles.ruleNumber}>1</div>
            <div>
              <h4>Graj dla wiedzy i zabawy</h4>
              <p>Traktuj wirtualny balans jako punktację w grze zręcznościowej, a nie jako wskaźnik sukcesu materialnego.</p>
            </div>
          </div>

          <div className={styles.ruleItem}>
            <div className={styles.ruleNumber}>2</div>
            <div>
              <h4>Analizuj swoje spiny</h4>
              <p>Zwracaj uwagę na to, jak często system kusi Cię "małymi wygranymi", które w rzeczywistości są mniejsze niż Twój oryginalny zakład.</p>
            </div>
          </div>

          <div className={styles.ruleItem}>
            <div className={styles.ruleNumber}>3</div>
            <div>
              <h4>Rób regularne przerwy</h4>
              <p>Nauka i mózg potrzebują resetu. Jeśli czujesz irytację z powodu serii przegranych rund – czas zamknąć kartę i odpocząć.</p>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};