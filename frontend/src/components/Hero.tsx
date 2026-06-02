import React from "react";
import { type HeroProps } from '../types/types.ts';
import styles from "./Hero.module.css"; // Import stylów modułowych

export const Hero: React.FC<HeroProps> = ({ title, description, image }) => {
  return (
    <section className={styles.hero}>
      <div className={styles.heroText}>
        <h1 className={styles.heroTitle}>{title}</h1>
        <p className={styles.heroDescription}>{description}</p>
      </div>

      <div className={styles.imageWrapper}>
        <img src={image} alt="Grafika edukacyjna" className={styles.heroImage} />
      </div>
    </section>
  );
};