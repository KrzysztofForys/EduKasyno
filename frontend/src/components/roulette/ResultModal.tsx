import { type PayoutInfo } from "./rouletteTypes";
import styles from "./ResultModal.module.css";

type ResultModalProps = {
  show: boolean;
  payoutInfo: PayoutInfo;
  onClose: () => void;
};

export const ResultModal = ({ show, payoutInfo, onClose }: ResultModalProps) => {
  if (!show || !payoutInfo.winningNum) return null;

  const isWin = payoutInfo.winAmount > 0;
  const { winningNum, totalBet, winAmount } = payoutInfo;

  return (
    <div className={`modal ${styles.modalOverlay}`}>
      <div
        className={`modal-content ${styles.modalContentCustom} ${isWin ? styles.modalWin : styles.modalLose
          }`}
      >
        {isWin ? (
          <h2 className={styles.modalTitleWin}>WYGRANA!</h2>
        ) : (
          <h2 className={styles.modalTitleLose}>Koniec rundy</h2>
        )}

        <p className={styles.modalLabel}>Wylosowano liczbę:</p>

        {/* Wyświetlenie wylosowanej liczby */}
        <div className={styles.winningNumberContainer}>
          <div
            className={`${styles.winningNumberCircle} ${winningNum.color === "red" ? styles.red : winningNum.color === "black" ? styles.black : styles.green
              }`}
          >
            {winningNum.value}
          </div>
        </div>

        {/* Podsumowanie zakładów */}
        <div className={styles.modalStatsBox}>
          <div className={`${styles.modalStatsRow} ${styles.mb10}`}>
            <span className={styles.statsLabel}>Łączny zakład:</span>
            <span className={styles.statsValue}>{totalBet} <img src="zeton-portfel.svg" alt="Żetony" style={{ width: "14px", height: "14px" }} /></span>
          </div>
          <div className={styles.modalStatsRow}>
            <span className={styles.statsLabel}>Wypłata:</span>
            <span className={isWin ? styles.statsValueWin : styles.statsValueLose}>
              {isWin ? `+${winAmount}` : "0"} <img src="zeton-portfel.svg" alt="Żetony" style={{ width: "14px", height: "14px" }} />
            </span>
          </div>
        </div>

        <button
          onClick={onClose}
          className={`${styles.modalBtn} ${isWin ? styles.modalBtnWin : styles.modalBtnLose}`}
        >
          Graj Dalej
        </button>
      </div>
    </div>
  );
};
