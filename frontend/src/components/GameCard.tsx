import React from "react";
import { useNavigate } from "react-router-dom";
import { type GameCardProps } from '../types/types.ts';
import styles from "./GameCard.module.css"; // Importujemy style modułowe

export const GameCard: React.FC<GameCardProps> = ({ title, desc, link, image }) => {
  const navigate = useNavigate();

  return (
    <div className={styles.card} onClick={() => navigate(link)}>
      {/* Kontener na obrazek, żeby kontrolować jego proporcje */}
      <div className={styles.imageWrapper}>
        <img src={image} alt={title} className={styles.cardImage} />
      </div>

      <div className={styles.cardContent}>
        <h3 className={styles.cardTitle}>{title}</h3>
        <p className={styles.cardDesc}>{desc}</p>
      </div>
    </div>
  );
};

export default GameCard;