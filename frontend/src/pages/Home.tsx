import React from "react";
import { Hero } from "../components/Hero";
import GameCard from "../components/GameCard";
import styles from "./Home.module.css"; // Import stylów modułowych

import RuletkaImg from "/Ruletka.png";
import SlotyImg from "/Sloty.png";
import ZdrapkiImg from "/Zdrapki.png";
import EduKasynoImg from "/EduKasyno.png";

export const Home: React.FC = () => {
  return (
    <div className={styles.homeContainer}>
      {/* Sekcja Hero */}
      <Hero
        title="Naucz się grać mądrze i odpowiedzialnie!"
        description="EduKasyno to Twoja brama do świata gier, gdzie bezpieczeństwo i edukacja są priorytetem."
        image={EduKasynoImg}
      />

      {/* Sekcja wyboru gier edukacyjnych */}
      <section className={styles.gamesSection}>
        <h2 className={styles.sectionTitle}>Odkryj nasze gry edukacyjne</h2>

        <div className={styles.cardsGrid}>
          <GameCard
            title="Sloty"
            desc="Ekscytujące bębny pełne szans na wygraną."
            link="/sloty"
            image={SlotyImg}
          />
          <GameCard
            title="Ruletka"
            desc="Zakręć kołem fortuny i sprawdź rachunek prawdopodobieństwa."
            link="/ruletka"
            image={RuletkaImg}
          />
          <GameCard
            title="Zdrapki"
            desc="Szybka zabawa, natychmiastowe nagrody i analiza statystyczna."
            link="/zdrapki"
            image={ZdrapkiImg}
          />
        </div>
      </section>
    </div>
  );
};

export default Home;