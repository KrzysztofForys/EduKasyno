import React from "react";
import styles from "./Contact.module.css";

export const Contact: React.FC = () => {
  return (
    <div className={styles.contactPage}>

      {/* Sekcja Nagłówka */}
      <section className={styles.headerSection}>
        <span className={styles.badge}>Nawiąż Połączenie</span>
        <h1 className={styles.title}>
          Skontaktuj się z <span>Złotą Załogą</span>
        </h1>
        <p className={styles.subtitle}>
          Chcesz podjąć współpracę barterową, zgłosić projekt edukacyjny, a może po prostu
          pogadać o algorytmach gry? Jesteśmy otwarci na wszelkie cyfrowe sygnały!
        </p>
      </section>

      {/* Główny Layout dwukolumnowy */}
      <div className={styles.layout}>

        {/* Lewa kolumna: Karty szybkiego kontaktu */}
        <div className={styles.cardsColumn}>

          <a href="mailto:wspolpraca@edukasyno.pl" className={`${styles.contactCard} ${styles.cardMail}`}>
            <div className={styles.cardIcon}>📩</div>
            <div className={styles.cardBody}>
              <h3>Napisz E-mail</h3>
              <p>wspolpraca@edukasyno.pl</p>
              <span className={styles.cardAction}>Wyślij wiadomość &rarr;</span>
            </div>
          </a>

          <a href="https://discord.gg/edukasyno" target="_blank" rel="noreferrer" className={`${styles.contactCard} ${styles.cardDiscord}`}>
            <div className={styles.cardIcon}>💬</div>
            <div className={styles.cardBody}>
              <h3>Dołącz do Discorda</h3>
              <p>Społeczność graczy i twórców EdTech</p>
              <span className={styles.cardAction}>Wejdź na serwer &rarr;</span>
            </div>
          </a>

          <div className={`${styles.contactCard} ${styles.cardBusiness}`}>
            <div className={styles.cardIcon}>🤝</div>
            <div className={styles.cardBody}>
              <h3>Media & Biznes</h3>
              <p>Oferty komercyjne i patronaty naukowe</p>
              <span className={styles.businessHours}>Pon - Pt | 9:00 - 17:00</span>
            </div>
          </div>

        </div>

        {/* Prawa kolumna: Informacje o bazie i Cyfrowa mapa */}
        <div className={styles.infoColumn}>
          <div className={styles.mapContainer}>
            <div className={styles.mapPlaceholder}>
              <div className={styles.radarPing}></div>
              <div className={styles.mapGridLines}></div>
              <span className={styles.mapText}>LOKALIZACJA BAZY OPERACYJNEJ:</span>
              <span className={styles.mapCoordinates}>50.2649° N, 19.0238° E (Katowice, PL)</span>
            </div>
          </div>

          <div className={styles.hqDetails}>
            <h3>Scentralizowany HQ</h3>
            <p>
              Mimo że operujemy głównie w chmurze z dowolnego zakątka globu, nasze serce
              i serwery analityczne znajdują się w technologicznej stolicy Śląska.
            </p>
            <div className={styles.statusIndicator}>
              <span className={styles.statusDot}></span> Systemy wsparcia online: <strong>Operacyjne</strong>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};