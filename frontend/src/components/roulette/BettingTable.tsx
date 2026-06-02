import styles from "./BettingTable.module.css";
import { BOARD_LAYOUT, SVG_CHIP_COLORS, CELL_W, CELL_H } from "./rouletteTypes";
import { getChipCoords } from "./rouletteLogic";
import { ChipSelector } from "./ChipSelector";

type BettingTableProps = {
  bets: Record<string, number>;
  hoveredBetKey: string | null;
  highlightedNumbers: number[];
  spinning: boolean;
  onPlaceBet: (betKey: string) => void;
  onRemoveBet: (e: React.MouseEvent, betKey: string) => void;
  onHoverChange: (key: string | null) => void;
  onMouseMoveOnGrid: (e: React.MouseEvent<SVGRectElement>, col: number, row: number) => void;

  // Nominały i czyszczenie zakładów
  selectedChip: number;
  onSelectChip: (nominal: number) => void;
  onClearBets: () => void;
};

export const BettingTable = ({
  bets,
  hoveredBetKey,
  highlightedNumbers,
  spinning,
  onPlaceBet,
  onRemoveBet,
  onHoverChange,
  onMouseMoveOnGrid,
  selectedChip,
  onSelectChip,
  onClearBets,
}: BettingTableProps) => {
  return (
    <div className={styles.tableSection}>
      <div className={styles.tableWrapper}>
        <svg viewBox="0 0 920 340" className={styles.tableSvg}>
          <defs>
            {/* Efekt podświetlenia hover pól */}
            <filter id="hoverGlow" x="-10%" y="-10%" width="120%" height="120%">
              <feDropShadow dx="0" dy="0" stdDeviation="6" floodColor="#ffffff" floodOpacity="0.8" />
            </filter>

            {/* Cień dla żetonów */}
            <filter id="chipShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="#000" floodOpacity="0.5" />
            </filter>

            {/* Gradient metalowego złotego obramowania dla żetonu 50 */}
            <linearGradient id="goldChipGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fff8db" />
              <stop offset="50%" stopColor="#d4af37" />
              <stop offset="100%" stopColor="#806000" />
            </linearGradient>
          </defs>

          {/* 1. Pole ZERA (0) po lewej stronie */}
          <g
            onClick={() => onPlaceBet("straight-0")}
            onContextMenu={(e) => onRemoveBet(e, "straight-0")}
            onMouseEnter={() => onHoverChange("straight-0")}
            onMouseLeave={() => onHoverChange(null)}
            className={styles.pointer}
          >
            <path
              d="M 70 10 L 70 205 L 10 107.5 Z"
              fill={highlightedNumbers.includes(0) ? "rgba(255,255,255,0.25)" : "#0c5921"}
              stroke="#d4af37"
              strokeWidth="2.5"
              filter={hoveredBetKey === "straight-0" ? "url(#hoverGlow)" : "none"}
            />
            <text x="45" y="107.5" textAnchor="middle" dominantBaseline="middle" fill="#ffffff" fontSize="22" fontWeight="bold" fontFamily="Poppins, sans-serif">
              0
            </text>
          </g>

          {/* 2. SIATKA LICZB (1 - 36) */}
          {BOARD_LAYOUT.map((row, rowIndex) =>
            row.map((num, colIndex) => {
              const x = 70 + colIndex * CELL_W;
              const y = 10 + rowIndex * CELL_H;
              const isCellHighlighted = highlightedNumbers.includes(num.value);

              return (
                <g key={`${rowIndex}-${colIndex}`}>
                  {/* Tło komórki liczby */}
                  <rect
                    x={x} y={y}
                    width={CELL_W} height={CELL_H}
                    fill={isCellHighlighted ? "rgba(255,255,255,0.25)" : num.color === "red" ? "#b31e1e" : "#1a1a1a"}
                    stroke="#d4af37"
                    strokeWidth="1.5"
                  />

                  {/* Niewidzialna komórka detekcji precyzyjnych zakładów (Split, Corner, Six Line itp.) */}
                  <rect
                    x={x} y={y}
                    width={CELL_W} height={CELL_H}
                    fill="transparent"
                    className={styles.pointer}
                    onMouseMove={(e) => onMouseMoveOnGrid(e, colIndex, rowIndex)}
                    onMouseLeave={() => onHoverChange(null)}
                    onClick={() => hoveredBetKey && onPlaceBet(hoveredBetKey)}
                    onContextMenu={(e) => {
                      e.preventDefault();
                      if (hoveredBetKey) onRemoveBet(e, hoveredBetKey);
                    }}
                  />

                  {/* Numer liczby stołu — przepuszczalny dla myszy */}
                  <text
                    x={x + CELL_W / 2} y={y + CELL_H / 2}
                    textAnchor="middle" dominantBaseline="middle"
                    fill="#ffffff" fontSize="18" fontWeight="bold"
                    fontFamily="Poppins, sans-serif"
                    pointerEvents="none"
                  >
                    {num.value}
                  </text>
                </g>
              );
            })
          )}

          {/* 3. PRZYCISKI KOLUMN "2:1" po prawej stronie stołu */}
          {BOARD_LAYOUT.map((_, rowIndex) => {
            const x = 70 + 12 * CELL_W;
            const y = 10 + rowIndex * CELL_H;
            const betKey = `column-${rowIndex}`;
            const isHighlighted = hoveredBetKey === betKey;

            return (
              <g
                key={`col-${rowIndex}`}
                onClick={() => onPlaceBet(betKey)}
                onContextMenu={(e) => onRemoveBet(e, betKey)}
                onMouseEnter={() => onHoverChange(betKey)}
                onMouseLeave={() => onHoverChange(null)}
                className={styles.pointer}
              >
                <rect
                  x={x} y={y}
                  width={CELL_W} height={CELL_H}
                  fill={isHighlighted ? "rgba(255,255,255,0.2)" : "#082612"}
                  stroke="#d4af37" strokeWidth="2"
                />
                <text
                  x={x + CELL_W / 2} y={y + CELL_H / 2}
                  textAnchor="middle" dominantBaseline="middle"
                  fill="#d4af37" fontSize="14" fontWeight="bold"
                  fontFamily="Poppins, sans-serif"
                >
                  2:1
                </text>
              </g>
            );
          })}

          {/* 4. SEKCJA TUZINÓW (Dozens) */}
          {[
            { label: "Tuzin 1", idx: 1 },
            { label: "Tuzin 2", idx: 2 },
            { label: "Tuzin 3", idx: 3 }
          ].map((dozen, i) => {
            const x = 70 + i * (CELL_W * 4);
            const y = 205;
            const betKey = `dozen-${dozen.idx}`;
            const isHighlighted = hoveredBetKey === betKey;

            return (
              <g
                key={`dozen-${i}`}
                onClick={() => onPlaceBet(betKey)}
                onContextMenu={(e) => onRemoveBet(e, betKey)}
                onMouseEnter={() => onHoverChange(betKey)}
                onMouseLeave={() => onHoverChange(null)}
                className={styles.pointer}
              >
                <rect
                  x={x} y={y}
                  width={CELL_W * 4} height={45}
                  fill={isHighlighted ? "rgba(255,255,255,0.2)" : "#082612"}
                  stroke="#d4af37" strokeWidth="2"
                />
                <text
                  x={x + (CELL_W * 4) / 2} y={y + 22.5}
                  textAnchor="middle" dominantBaseline="middle"
                  fill="#ffffff" fontSize="13" fontWeight="bold"
                  fontFamily="Poppins, sans-serif"
                >
                  {dozen.label}
                </text>
              </g>
            );
          })}

          {/* 5. ZAKŁADY ZEWNĘTRZNE PROSTE (Outside Bets) */}
          {[
            { label: "1-18", key: "outside-low" },
            { label: "Parzyste", key: "outside-even" },
            { label: "Czerwone", key: "outside-red", color: "red" },
            { label: "Czarne", key: "outside-black", color: "black" },
            { label: "Nieparzyste", key: "outside-odd" },
            { label: "19-36", key: "outside-high" }
          ].map((bet, i) => {
            const x = 70 + i * (CELL_W * 2);
            const y = 250;
            const isHighlighted = hoveredBetKey === bet.key;

            return (
              <g
                key={`outside-${i}`}
                onClick={() => onPlaceBet(bet.key)}
                onContextMenu={(e) => onRemoveBet(e, bet.key)}
                onMouseEnter={() => onHoverChange(bet.key)}
                onMouseLeave={() => onHoverChange(null)}
                className={styles.pointer}
              >
                <rect
                  x={x} y={y}
                  width={CELL_W * 2} height={45}
                  fill={
                    isHighlighted
                      ? "rgba(255,255,255,0.2)"
                      : bet.color === "red"
                        ? "#b31e1e"
                        : bet.color === "black"
                          ? "#1a1a1a"
                          : "#082612"
                  }
                  stroke="#d4af37" strokeWidth="2"
                />

                {/* Element graficzny rombu zamiast tekstu dla kolorów */}
                {bet.color ? (
                  <polygon
                    points={`${x + CELL_W},${y + 10} ${x + CELL_W * 1.5},${y + 22.5} ${x + CELL_W},${y + 35} ${x + CELL_W * 0.5},${y + 22.5}`}
                    fill={bet.color === "red" ? "#ff1a1a" : "#111111"}
                    stroke="#ffffff"
                    strokeWidth="1.5"
                  />
                ) : (
                  <text
                    x={x + CELL_W} y={y + 22.5}
                    textAnchor="middle" dominantBaseline="middle"
                    fill="#ffffff" fontSize="13" fontWeight="bold"
                    fontFamily="Poppins, sans-serif"
                  >
                    {bet.label}
                  </text>
                )}
              </g>
            );
          })}

          {/* 6. DYNAMICZNE RYSOWANIE POSTAWIONYCH ŻETONÓW NA POZYCJACH GEOMETRYCZNYCH */}
          {Object.entries(bets).map(([betKey, betValue]) => {
            const { cx, cy } = getChipCoords(betKey);

            // Przyporządkowanie nominału żetonu na podstawie łącznej kwoty
            const chipNominalList = [50, 20, 10, 5, 2, 1];
            let highestNominal = 1;
            for (const nominal of chipNominalList) {
              if (betValue >= nominal) { highestNominal = nominal; break; }
            }

            const isStandardNominal = [1, 2, 5, 10, 20, 50].includes(betValue);
            const textColor = (highestNominal === 1 || highestNominal === 2) ? "#111111" : "#ffffff";
            const svgCenterColor = SVG_CHIP_COLORS[highestNominal] || "#ffffff";

            return (
              <g key={betKey} filter="url(#chipShadow)" className={styles.peNone}>
                {/* Wczytanie obrazka SVG żetonu */}
                <image
                  href={`zeton-${highestNominal}.svg`}
                  x={cx - 16} y={cy - 16}
                  width="32" height="32"
                />

                {/* Biały border wokół żetonu */}
                <circle cx={cx} cy={cy} r="16" fill="none" stroke="#ffffff" strokeWidth="1.5" />

                {/* Zakrywający środek z wartością dla niestandardowych kwot */}
                {!isStandardNominal && (
                  <>
                    <circle cx={cx} cy={cy} r="7.5" fill={svgCenterColor} />
                    <text
                      x={cx} y={cy}
                      textAnchor="middle" dominantBaseline="middle"
                      fill={textColor} fontSize="9" fontWeight="bold"
                      fontFamily="Poppins, sans-serif"
                    >
                      {betValue}
                    </text>
                  </>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Pasek wyboru nominałów przeniesiony do wnętrza zielonego stołu */}
      <ChipSelector
        selectedChip={selectedChip}
        spinning={spinning}
        onSelectChip={onSelectChip}
        onClearBets={onClearBets}
      />
    </div>
  );
};
