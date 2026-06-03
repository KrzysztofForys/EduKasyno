import styles from "./WinPopUp.module.css";
import { audio } from "../utils/audio";

interface WinPopUpProps {
    message: string;
    theme: "classic" | "gold" | "extreme";
    winAmount: number;
    betAmount: number;
    onClose: () => void;
    icon?: React.ReactNode;
}

export default function WinPopUp({ message, winAmount, betAmount, theme, onClose, icon }: WinPopUpProps) {

    if (winAmount > 0) {
        audio.playWinSound(winAmount >= betAmount * 2);
    } else {
        audio.playLoseSound();
    }

    return (
        <div className={styles.modal}>
            <div
                className={`${styles.modalContent} ${theme === "classic"
                    ? styles.modalThemeClassic
                    : theme === "gold"
                        ? styles.modalThemeGold
                        : styles.modalThemeExtreme
                    }`}
            >
                {winAmount > 0 ? (
                    <>
                        <div className={styles.modalIcon}>{icon || "🎉"}</div>
                        <h2 className={`${styles.modalTitle} styles.modalTitleWin`}>Gratulacje!</h2>
                        <div className={styles.modalPayout}>
                            <span>+{winAmount}</span>
                            <img src="zeton-portfel.svg" alt="Żetony" style={{ width: "28px" }} />
                        </div>
                        <p className={styles.modalText}>
                            {message}
                        </p>
                    </>
                ) : (
                    <>
                        <div className={styles.modalIcon}>😢</div>
                        <h2 className={`${styles.modalTitle} styles.modalTitleLose`}>Spróbuj Ponownie</h2>
                        <p className={styles.modalText} style={{ marginTop: "18px" }}>
                            Tym razem się nie udało. Nie poddawaj się!
                        </p>
                    </>
                )}
                <button className={styles.modalButton} onClick={onClose}>
                    Zagraj Ponownie
                </button>
            </div>
        </div>
    )
}
