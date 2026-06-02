import React from "react";
import styles from "./Team.module.css";

interface TeamMember {
  id: number;
  name: string;
  role: string;
  description: string;
  emoji: string;
  tierClass: string; // Klasa określająca kolor poświaty z :root
  specialty: string;
}

export const Team: React.FC = () => {
  const members: TeamMember[] = [
    {
      id: 1,
      name: "Oskar 'Oskarito'",
      role: "Lead Founder & Visionary",
      description: "Mózg operacyjny projektu. Przekształca skomplikowaną mechanikę kasynową w przystępne i wciągające moduły edukacyjne.",
      emoji: "👑",
      tierClass: styles.tierExtreme,
      specialty: "Gamification / UX Architecture"
    },
    {
      id: 2,
      name: "Dr. Kamila",
      role: "EdTech Methodologist",
      description: "Dba o to, aby za każdym spinem i zakładem szła realna wartość naukowa. Projektuje ścieżki zapamiętywania wiedzy.",
      emoji: "🧠",
      tierClass: styles.tierCyjan,
      specialty: "Cognitive Psychology / Learning Design"
    },
    {
      id: 3,
      name: "Alex 'Byte'",
      role: "Core Systems Developer",
      description: "Czarodziej kodu, który dba o to, by animacje bębnów slotów i algorytmy obliczania balansu śmigały w 120 FPS bez zająknięcia.",
      emoji: "💻",
      tierClass: styles.tierGold,
      specialty: "React / High-Performance Animations"
    }
  ];

  return (
    <div className={styles.teamPage}>

      {/* Nagłówek sekcji */}
      <section className={styles.headerSection}>
        <span className={styles.badge}>Ekipa EduKasyna</span>
        <h1 className={styles.title}>
          Twórcy <span>Nowej Ery</span> Nauki
        </h1>
        <p className={styles.subtitle}>
          Połączyliśmy siły z różnych światów – od psychologii rozwoju, przez zaawansowany programowanie,
          aż po design gier – aby stworzyć produkt, od którego nie można się oderwać.
        </p>
      </section>

      {/* Siatka z kartami zespołu */}
      <section className={styles.teamGrid}>
        {members.filter(m => m.id === 1).map((member) => (
          <div key={member.id} className={`${styles.memberCard} ${member.tierClass}`}>

            {/* Awatar z emoji i tłem premium */}
            <div className={styles.avatarContainer}>
              <span className={styles.avatarEmoji}>{member.emoji}</span>
            </div>

            {/* Dane i opis */}
            <div className={styles.infoContainer}>
              <h3 className={styles.memberName}>{member.name}</h3>
              <div className={styles.memberRole}>{member.role}</div>
              <p className={styles.memberDescription}>{member.description}</p>
            </div>

            {/* Specjalizacja na dole karty (jako growy perk / statystyka) */}
            <div className={styles.specialtyBadge}>
              <span className={styles.specialtyLabel}>PRO PERK:</span> {member.specialty}
            </div>

          </div>
        ))}
      </section>

    </div>
  );
};