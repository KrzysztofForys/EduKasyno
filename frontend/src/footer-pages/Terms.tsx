import React, { useState } from "react";
import styles from "./Terms.module.css";

interface TermSection {
  id: number;
  title: string;
  emoji: string;
  content: string;
}

export const Terms: React.FC = () => {
  const [activeSection, setActiveSection] = useState<number | null>(null);

  const toggleSection = (id: number) => {
    setActiveSection(activeSection === id ? null : id);
  };

  const sections: TermSection[] = [
    {
      id: 1,
      title: "Postanowienia Ogólne i Cel Platformy",
      emoji: "📱",
      content: "EduKasyno jest platformą wyłącznie edukacyjno-rozrywkową (Gamified EdTech). Korzystanie z serwisu jest w 100% darmowe i ma na celu zwiększanie kompetencji intelektualnych użytkowników oraz edukację w zakresie matematyki, prawdopodobieństwa i statystyki."
    },
    {
      id: 2,
      title: "Wirtualny Balans i Brak Prawdziwych Pieniędzy",
      emoji: "🚫",
      content: "Wszystkie żetony, monety oraz bilans konta widoczne w serwisie są wyłącznie punktami wirtualnymi. Serwis nie obsługuje, nie przyjmuje ani nie wypłaca prawdziwych środków płatniczych (PLN, USD, EUR itp.) ani kryptowalut. Wirtualny balans nie posiada żadnej wartości materialnej."
    },
    {
      id: 3,
      title: "Zasady Rozgrywki (Sloty, Quizy, Gry)",
      emoji: "🎰",
      content: "Warunkiem wzięcia udziału w grach losowych na platformie (np. obracanie bębnami slotów) jest podjęcie wyzwania edukacyjnego (np. udzielenie odpowiedzi na pytanie testowe lub matematyczne). Wygrane są naliczane na podstawie wbudowanych algorytmów RNG (Generatora Liczb Losowych) połączonych z poprawnością udzielanych odpowiedzi."
    },
    {
      id: 4,
      title: "Konta Użytkowników i Bezpieczeństwo",
      emoji: "🔐",
      content: "Użytkownik zobowiązuje się do korzystania z serwisu w sposób uczciwy. Wykorzystywanie błędów oprogramowania (bugów), skryptów automatyzujących (botów) lub modyfikowanie kodu gry w celu sztucznego zawyżania balansu punktów jest zabronione i skutkuje resetem konta."
    },
    {
      id: 5,
      title: "Odpowiedzialność i Zmiany w Serwisie",
      emoji: "⚙️",
      content: "Administracja zastrzega sobie prawo do modyfikowania mechanik gry, stawek, mnożników oraz bazy pytań w celu zachowania balansu rozgrywki (RTP) i optymalizacji procesu edukacyjnego. Serwis nie ponosi odpowiedzialności za ewentualne przerwy w dostępie do platformy."
    }
  ];

  return (
    <div className={styles.termsPage}>

      {/* Nagłówek */}
      <section className={styles.headerSection}>
        <span className={styles.badge}>Zasady Platformy</span>
        <h1 className={styles.title}>
          Regulamin <span>EduKasyna</span>
        </h1>
        <p className={styles.subtitle}>
          Przejrzyste, uczciwe i proste reguły naszej gry. Przeczytaj, jak działamy i jakie prawa
          oraz obowiązki przysługują każdemu graczowi.
        </p>
      </section>

      {/* Kontener Harmonijki (Accordion) */}
      <section className={styles.accordionContainer}>
        {sections.map((section) => {
          const isOpen = activeSection === section.id;
          return (
            <div
              key={section.id}
              className={`${styles.accordionItem} ${isOpen ? styles.itemOpen : ""}`}
            >
              {/* Nagłówek panelu - klikalny */}
              <button
                className={styles.accordionHeader}
                onClick={() => toggleSection(section.id)}
                aria-expanded={isOpen}
              >
                <div className={styles.headerTitleGroup}>
                  <span className={styles.icon}>{section.emoji}</span>
                  <h3>{section.title}</h3>
                </div>
                {/* Strzałka indykatora rozwijania */}
                <span className={`${styles.arrow} ${isOpen ? styles.arrowRotated : ""}`}>
                  ▼
                </span>
              </button>

              {/* Zawartość panelu - płynnie wysuwana */}
              <div className={`${styles.accordionContent} ${isOpen ? styles.contentVisible : ""}`}>
                <div className={styles.contentInner}>
                  <p>{section.content}</p>
                </div>
              </div>

            </div>
          );
        })}
      </section>

    </div>
  );
};