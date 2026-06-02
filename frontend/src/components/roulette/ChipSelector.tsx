import styles from "./ChipSelector.module.css";

type ChipSelectorProps = {
  selectedChip: number;
  spinning: boolean;
  onSelectChip: (nominal: number) => void;
  onClearBets: () => void;
};

export const ChipSelector = ({ selectedChip, spinning, onSelectChip, onClearBets }: ChipSelectorProps) => {
  return (
    <div className={styles.controlsBar}>

      {/* Wybór nominału żetonu */}
      <div>
        <span className={styles.chipLabel}>Nominał Żetonu:</span>
        <div className={styles.chipList}>
          {[1, 2, 5, 10, 20, 50].map((nominal) => {
            const isSelected = selectedChip === nominal;
            return (
              <button
                key={nominal}
                onClick={() => onSelectChip(nominal)}
                className={`${styles.chipButton} ${isSelected ? styles.chipSelected : ""} ${styles[`chipBtn${nominal}` as keyof typeof styles]}`}
              >
                <img
                  src={`zeton-${nominal}.svg`}
                  alt={`Żeton ${nominal}`}
                  className={styles.chipImg}
                />
              </button>
            );
          })}
        </div>
      </div>

      {/* Przycisk Wyczyść */}
      <div className={styles.actions}>
        <button
          onClick={onClearBets}
          disabled={spinning}
          className={styles.clearBtn}
        >
          Wyczyść
        </button>
      </div>
    </div>
  );
};
