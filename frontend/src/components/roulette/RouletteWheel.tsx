import { type RouletteNumber, WHEEL_NUMBERS } from "./rouletteTypes";
import { describeArc } from "./rouletteLogic";
import styles from "./RouletteWheel.module.css";

// Indywidualne przesunięcia kątowe (w stopniach) dla każdego z 8 deflektorów w celu nadania im niesymetrycznego obrotu
const DEFLECTOR_ROTATIONS = [75, 60, 110, 100, 270, 300, 300, 100];

// Deflektory geometryczne (pozycje i obroty) – eksportowane dla logiki kolizji
export const DEFLECTORS = [0, 45, 90, 135, 180, 225, 270, 315].map((deg, idx) => {
  const rad = (deg - 90) * Math.PI / 180;
  const cx = 250 + 176 * Math.cos(rad);
  const cy = 250 + 176 * Math.sin(rad);
  const rotation = deg + (DEFLECTOR_ROTATIONS[idx] || 0);
  return { deg, cx, cy, rotation };
});

type RouletteWheelProps = {
  wheelAngle: number;
  ballX: number;
  ballY: number;
  history: RouletteNumber[];
};

export const RouletteWheel = ({ wheelAngle, ballX, ballY, history }: RouletteWheelProps) => {
  return (
    <div className={styles.wheelSection}>

      <svg viewBox="0 0 500 500" width="100%" height="auto" className={styles.wheelSvg}>
        <defs>
          {/* Radialny gradient drewna mahoniowego obudowy */}
          <radialGradient id="woodGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#803300" />
            <stop offset="70%" stopColor="#4d1a00" />
            <stop offset="90%" stopColor="#260d00" />
            <stop offset="100%" stopColor="#0d0400" />
          </radialGradient>

          {/* Metaliczny gradient błyszczącego złota */}
          <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffeb99" />
            <stop offset="30%" stopColor="#d4af37" />
            <stop offset="50%" stopColor="#aa7c11" />
            <stop offset="70%" stopColor="#d4af37" />
            <stop offset="100%" stopColor="#ffeb99" />
          </linearGradient>

          {/* Srebrzysty gradient chromu dla wrzeciona */}
          <radialGradient id="chromeGrad" cx="40%" cy="40%" r="60%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="50%" stopColor="#b3b3b3" />
            <stop offset="85%" stopColor="#595959" />
            <stop offset="100%" stopColor="#1a1a1a" />
          </radialGradient>

          {/* Złoty gradient stożkowy dla elementu centralnego */}
          <radialGradient id="spindleGold" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffe680" />
            <stop offset="60%" stopColor="#997300" />
            <stop offset="100%" stopColor="#4d3900" />
          </radialGradient>

          {/* Specularny gradient błyszczącej białej perłowej kulki */}
          <radialGradient id="ballShiny" cx="35%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="40%" stopColor="#f2f2f2" />
            <stop offset="85%" stopColor="#b3b3b3" />
            <stop offset="100%" stopColor="#737373" />
          </radialGradient>

          {/* Cień wewnętrzny kieszeni dla efektu głębokości 3D */}
          <radialGradient id="pocketShadow" cx="50%" cy="50%" r="50%">
            <stop offset="75%" stopColor="transparent" stopOpacity="0" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0.85" />
          </radialGradient>
        </defs>

        {/* 1. Zewnętrzna drewniana obudowa koła */}
        <circle cx="250" cy="250" r="240" fill="url(#woodGrad)" stroke="#1a0a00" strokeWidth="6" />
        <circle cx="250" cy="250" r="218" fill="none" stroke="url(#goldGrad)" strokeWidth="4" />

        {/* 2. Tory ślizgu kulki */}
        <circle cx="250" cy="250" r="208" fill="#141416" stroke="#000000" strokeWidth="2" />
        <circle cx="250" cy="250" r="163" fill="none" stroke="#252528" strokeWidth="6" />
        <circle cx="250" cy="250" r="160" fill="none" stroke="#0d0d0f" strokeWidth="2" />

        {/* 3. OBRACAJĄCY SIĘ RDZEŃ KOŁA */}
        <g transform={`rotate(${wheelAngle}, 250, 250)`}>
          {/* Czarna tarcza bazowa przedziałów */}
          <circle cx="250" cy="250" r="148" fill="#0d0d10" />

          {/* Rysowanie wycinków kieszeni (pockets) */}
          {WHEEL_NUMBERS.map((item, i) => {
            const step = 360 / WHEEL_NUMBERS.length;
            const startA = i * step;
            const endA = (i + 1) * step;
            const midA = startA + step / 2;

            // Pozycja cyfry na tarczy (zmniejszony promień)
            const textPos = {
              x: 250 + 126 * Math.cos((midA - 90) * Math.PI / 180),
              y: 250 + 126 * Math.sin((midA - 90) * Math.PI / 180)
            };

            return (
              <g key={i}>
                {/* Wycinek koła wypełniony kolorem przedziału */}
                <path
                  d={describeArc(250, 250, 148, startA, endA)}
                  fill={item.color === "red" ? "#cc0000" : item.color === "black" ? "#1e1e1e" : "#008000"}
                  stroke="url(#goldGrad)"
                  strokeWidth="0.8"
                />

                {/* Nakładka cieniująca kieszeń dla efektu 3D */}
                <path
                  d={describeArc(250, 250, 148, startA, endA)}
                  fill="url(#pocketShadow)"
                />

                {/* Wyświetlanie numeru kieszeni z odpowiednim obróceniem do środka */}
                <text
                  x={textPos.x}
                  y={textPos.y}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="#ffffff"
                  fontSize="10"
                  fontWeight="bold"
                  fontFamily="Outfit, Montserrat, sans-serif"
                  transform={`rotate(${midA}, ${textPos.x}, ${textPos.y})`}
                >
                  {item.value}
                </text>
              </g>
            );
          })}

          {/* Wewnętrzny złoty pierścień oddzielający kieszenie od metalowego środka */}
          <circle cx="250" cy="250" r="106" fill="none" stroke="url(#goldGrad)" strokeWidth="3.5" />

          {/* Stożkowy środek wrzeciona */}
          <circle cx="250" cy="250" r="104" fill="#1c1d22" />
          <circle cx="250" cy="250" r="55" fill="url(#spindleGold)" stroke="url(#goldGrad)" strokeWidth="1.5" />
          <circle cx="250" cy="250" r="36" fill="url(#chromeGrad)" stroke="#666666" strokeWidth="0.8" />

          {/* Cztery ramiona/uchwyty wrzeciona ruletki (spindle handles) */}
          {[0, 90, 180, 270].map((deg) => {
            const angleRad = (deg - 90) * Math.PI / 180;
            const spokeEndX = 250 + 50 * Math.cos(angleRad);
            const spokeEndY = 250 + 50 * Math.sin(angleRad);
            return (
              <g key={deg}>
                <line
                  x1="250" y1="250"
                  x2={spokeEndX} y2={spokeEndY}
                  stroke="url(#chromeGrad)"
                  strokeWidth="5"
                  strokeLinecap="round"
                />
                <circle
                  cx={spokeEndX} cy={spokeEndY}
                  r="7"
                  fill="url(#goldGrad)"
                  stroke="#805d00"
                  strokeWidth="1"
                />
              </g>
            );
          })}

          {/* 37 złotych przegródek łączących kieszenie ze środkiem wrzeciona */}
          {WHEEL_NUMBERS.map((_, i) => {
            const step = 360 / WHEEL_NUMBERS.length;
            const rad = (i * step - 90) * Math.PI / 180;
            return (
              <line
                key={`divider-${i}`}
                x1={250 + 55 * Math.cos(rad)}
                y1={250 + 55 * Math.sin(rad)}
                x2={250 + 148 * Math.cos(rad)}
                y2={250 + 148 * Math.sin(rad)}
                stroke="url(#goldGrad)"
                strokeWidth="1.2"
                opacity="0.9"
              />
            );
          })}

          {/* Środkowy nit wrzeciona */}
          <circle cx="250" cy="250" r="10" fill="url(#chromeGrad)" />
          <circle cx="250" cy="250" r="5" fill="#0c0c0e" />
        </g>

{DEFLECTORS.map((d, idx) => (
          <g key={idx} transform={`rotate(${d.rotation}, ${d.cx}, ${d.cy})`}>
            <polygon
              points={`${d.cx},${d.cy - 12} ${d.cx + 12},${d.cy} ${d.cx},${d.cy + 12} ${d.cx - 12},${d.cy}`}
              fill="#444"
              stroke="url(#goldGrad)"
              strokeWidth="1"
            />
          </g>
        ))}

        {/* 4. NIEZALEŻNA KULKA RULETKI */}
        <circle
          cx={ballX}
          cy={ballY}
          r="7.5"
          fill="url(#ballShiny)"
          filter="drop-shadow(-2px 4px 4px rgba(0,0,0,0.65))"
        />
      </svg>

      {/* Ostatnie wyniki */}
      <div className={styles.historyContainer}>
        <span className={styles.historyHeader}>Ostatnie 5 liczb:</span>
        <div className={styles.historyList}>
          {history.length === 0 ? (
            <div className={styles.historyEmpty}>Brak historii</div>
          ) : (
            history.map((num, idx) => (
              <div
                key={idx}
                className={`${styles.historyCircle} ${num.color === "red" ? styles.red : num.color === "black" ? styles.black : styles.green
                  }`}
              >
                {num.value}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
