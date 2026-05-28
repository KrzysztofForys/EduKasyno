import { useState, useEffect, useRef } from "react";
import styles from "./Roulette.module.css";

// Definicja typów dla koloru pól w ruletce
type RouletteColor = "black" | "red" | "green";

// Definicja pojedynczego numeru w ruletce
type RouletteNumber = {
  value: number;
  color: RouletteColor;
};

// Definicja właściwości wejściowych komponentu ruletki
type RouletteProps = {
  balance: number;
  setBalance: React.Dispatch<React.SetStateAction<number>>;
};

// Lista liczb na kole ruletki w standardowym układzie europejskim (od 0 do 36)
const WHEEL_NUMBERS: RouletteNumber[] = [
  { value: 0, color: "green" },
  { value: 32, color: "red" },
  { value: 15, color: "black" },
  { value: 19, color: "red" },
  { value: 4, color: "black" },
  { value: 21, color: "red" },
  { value: 2, color: "black" },
  { value: 25, color: "red" },
  { value: 17, color: "black" },
  { value: 34, color: "red" },
  { value: 6, color: "black" },
  { value: 27, color: "red" },
  { value: 13, color: "black" },
  { value: 36, color: "red" },
  { value: 11, color: "black" },
  { value: 30, color: "red" },
  { value: 8, color: "black" },
  { value: 23, color: "red" },
  { value: 10, color: "black" },
  { value: 5, color: "red" },
  { value: 24, color: "black" },
  { value: 16, color: "red" },
  { value: 33, color: "black" },
  { value: 1, color: "red" },
  { value: 20, color: "black" },
  { value: 14, color: "red" },
  { value: 31, color: "black" },
  { value: 9, color: "red" },
  { value: 22, color: "black" },
  { value: 18, color: "red" },
  { value: 29, color: "black" },
  { value: 7, color: "red" },
  { value: 28, color: "black" },
  { value: 12, color: "red" },
  { value: 35, color: "black" },
  { value: 3, color: "red" },
  { value: 26, color: "black" }
];

// Dwuwymiarowa tablica reprezentująca rozkład stołu (12 kolumn, 3 wiersze)
// Zwróć uwagę, że górny wiersz zawiera liczby podzielne przez 3 (3,6,9...36),
// środkowy to 2,5,8...35, a dolny to 1,4,7...34.
const BOARD_LAYOUT: RouletteNumber[][] = [
  [
    { value: 3, color: "red" },
    { value: 6, color: "black" },
    { value: 9, color: "red" },
    { value: 12, color: "red" },
    { value: 15, color: "black" },
    { value: 18, color: "red" },
    { value: 21, color: "red" },
    { value: 24, color: "black" },
    { value: 27, color: "red" },
    { value: 30, color: "red" },
    { value: 33, color: "black" },
    { value: 36, color: "red" }
  ],
  [
    { value: 2, color: "black" },
    { value: 5, color: "red" },
    { value: 8, color: "black" },
    { value: 11, color: "black" },
    { value: 14, color: "red" },
    { value: 17, color: "black" },
    { value: 20, color: "black" },
    { value: 23, color: "red" },
    { value: 26, color: "black" },
    { value: 29, color: "black" },
    { value: 32, color: "red" },
    { value: 35, color: "black" }
  ],
  [
    { value: 1, color: "red" },
    { value: 4, color: "black" },
    { value: 7, color: "red" },
    { value: 10, color: "black" },
    { value: 13, color: "black" },
    { value: 16, color: "red" },
    { value: 19, color: "red" },
    { value: 22, color: "black" },
    { value: 25, color: "red" },
    { value: 28, color: "black" },
    { value: 31, color: "black" },
    { value: 34, color: "red" }
  ]
];

// Lista kolorów żetonów dopasowana do nominałów
const CHIP_COLORS: Record<number, string> = {
  1: "#ffffff",   // biały
  2: "#ff4d4d",   // czerwony
  5: "#3399ff",   // niebieski
  10: "#33cc66",  // zielony
  20: "#1a1a1a",  // czarny
  50: "#ffd700"   // złoty
};

// Funkcja pomocnicza do rysowania łuków SVG koła ruletki
function describeArc(cx: number, cy: number, r: number, startAngle: number, endAngle: number): string {
  const rad1 = (startAngle - 90) * Math.PI / 180;
  const rad2 = (endAngle - 90) * Math.PI / 180;
  const x1 = cx + r * Math.cos(rad1);
  const y1 = cy + r * Math.sin(rad1);
  const x2 = cx + r * Math.cos(rad2);
  const y2 = cy + r * Math.sin(rad2);
  
  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
  
  return [
    `M ${cx} ${cy}`,
    `L ${x1} ${y1}`,
    `A ${r} ${r} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
    "Z"
  ].join(" ");
}

export const Roulette = ({ balance, setBalance }: RouletteProps) => {
  // Rozmiary komórek siatki liczb stołu bukmacherskiego
  const CELL_W = 65;
  const CELL_H = 65;

  // Stany gry
  const [selectedChip, setSelectedChip] = useState<number>(5); // Wybrany nominał żetonu (1, 2, 5, 10, 20, 50)
  const [bets, setBets] = useState<Record<string, number>>({}); // Aktywne zakłady gracza (klucz -> kwota)
  const [spinning, setSpinning] = useState<boolean>(false); // Flag określająca, czy koło wiruje
  const [wheelAngle, setWheelAngle] = useState<number>(0); // Kąt obrotu koła ruletki
  const [ballAngle, setBallAngle] = useState<number>(0); // Kąt obrotu kulki
  const [ballRadius, setBallRadius] = useState<number>(180); // Promień orbity kulki (maleje podczas wirowania)
  const [history, setHistory] = useState<RouletteNumber[]>([]); // Ostatnie 5 wylosowanych liczb
  const [hoveredBetKey, setHoveredBetKey] = useState<string | null>(null); // Obecnie podświetlony zakład (hover)
  const [showResultModal, setShowResultModal] = useState<boolean>(false); // Czy pokazać popup z wygraną
  const [payoutInfo, setPayoutInfo] = useState<{ totalBet: number; winAmount: number; winningNum: RouletteNumber | null }>({
    totalBet: 0,
    winAmount: 0,
    winningNum: null
  });

  const animationFrameId = useRef<number | null>(null);

  // Funkcja zwracająca listę liczb objętych danym zakładem na podstawie unikalnego klucza zakładu
  const getTargetedNumbers = (betKey: string): number[] => {
    if (!betKey) return [];
    
    // Zakład na pojedynczą liczbę (Straight Up)
    if (betKey.startsWith("straight-")) {
      const val = parseInt(betKey.replace("straight-", ""), 10);
      return [val];
    }
    
    // Zakład na parę w poziomie (Horizontal Split)
    if (betKey.startsWith("split-h-")) {
      const parts = betKey.replace("split-h-", "").split("-");
      const col = parseInt(parts[0], 10);
      const row = parseInt(parts[1], 10);
      const num1 = BOARD_LAYOUT[row][col].value;
      const num2 = BOARD_LAYOUT[row][col + 1].value;
      return [num1, num2];
    }
    
    // Zakład na parę w pionie (Vertical Split)
    if (betKey.startsWith("split-v-")) {
      const parts = betKey.replace("split-v-", "").split("-");
      const col = parseInt(parts[0], 10);
      const row = parseInt(parts[1], 10);
      const num1 = BOARD_LAYOUT[row][col].value;
      const num2 = BOARD_LAYOUT[row + 1][col].value;
      return [num1, num2];
    }
    
    // Zakład na parę z zerem (Zero Split)
    if (betKey.startsWith("split-zero-")) {
      const row = parseInt(betKey.replace("split-zero-", ""), 10);
      const num = BOARD_LAYOUT[row][0].value;
      return [0, num];
    }
    
    // Zakład na czwórkę (Corner / Square)
    if (betKey.startsWith("corner-")) {
      const parts = betKey.replace("corner-", "").split("-");
      const col = parseInt(parts[0], 10);
      const row = parseInt(parts[1], 10);
      return [
        BOARD_LAYOUT[row][col].value,
        BOARD_LAYOUT[row][col + 1].value,
        BOARD_LAYOUT[row + 1][col].value,
        BOARD_LAYOUT[row + 1][col + 1].value
      ];
    }
    
    // Zakład na szóstkę (Six Line)
    if (betKey.startsWith("sixline-")) {
      const col = parseInt(betKey.replace("sixline-", ""), 10);
      const nums: number[] = [];
      for (let r = 0; r < 3; r++) {
        nums.push(BOARD_LAYOUT[r][col].value);
        nums.push(BOARD_LAYOUT[r][col + 1].value);
      }
      return nums;
    }
    
    // Zakład na rząd (Column)
    if (betKey.startsWith("column-")) {
      const row = parseInt(betKey.replace("column-", ""), 10);
      return BOARD_LAYOUT[row].map(item => item.value);
    }
    
    // Zakład na tuzin (Dozen)
    if (betKey.startsWith("dozen-")) {
      const idx = parseInt(betKey.replace("dozen-", ""), 10); // 1, 2 lub 3
      const start = (idx - 1) * 12 + 1;
      const end = idx * 12;
      const nums: number[] = [];
      for (let i = start; i <= end; i++) nums.push(i);
      return nums;
    }
    
    // Zakłady zewnętrzne proste
    if (betKey === "outside-red") {
      return WHEEL_NUMBERS.filter(num => num.color === "red").map(num => num.value);
    }
    if (betKey === "outside-black") {
      return WHEEL_NUMBERS.filter(num => num.color === "black").map(num => num.value);
    }
    if (betKey === "outside-even") {
      return Array.from({ length: 36 }, (_, i) => i + 1).filter(num => num % 2 === 0);
    }
    if (betKey === "outside-odd") {
      return Array.from({ length: 36 }, (_, i) => i + 1).filter(num => num % 2 !== 0);
    }
    if (betKey === "outside-low") {
      return Array.from({ length: 18 }, (_, i) => i + 1);
    }
    if (betKey === "outside-high") {
      return Array.from({ length: 18 }, (_, i) => i + 19);
    }
    
    return [];
  };

  // Łączna suma aktualnie postawionych zakładów
  const totalBetAmount = Object.values(bets).reduce((acc, val) => acc + val, 0);

  // Funkcja czyszczenia wszystkich aktualnych zakładów na stole
  const handleClearBets = () => {
    if (spinning) return;
    setBets({});
  };



  // Logika dodawania żetonu na wybrane pole stołu
  const handlePlaceBet = (betKey: string) => {
    if (spinning) return;
    
    if (balance < selectedChip) {
      alert("Niewystarczające środki w portfelu!");
      return;
    }

    setBalance(prev => prev - selectedChip);
    setBets(prev => ({
      ...prev,
      [betKey]: (prev[betKey] || 0) + selectedChip
    }));
  };

  // Logika usuwania żetonu z pola (kliknięcie z przytrzymanym klawiszem Shift lub kliknięcie prawym przyciskiem myszy)
  const handleRemoveBet = (e: React.MouseEvent, betKey: string) => {
    e.preventDefault();
    if (spinning || !bets[betKey]) return;

    const currentBet = bets[betKey];
    const amountToRemove = Math.min(selectedChip, currentBet);
    
    setBalance(prev => prev + amountToRemove);
    setBets(prev => {
      const updated = { ...prev };
      if (updated[betKey] <= selectedChip) {
        delete updated[betKey];
      } else {
        updated[betKey] -= selectedChip;
      }
      return updated;
    });
  };

  // Przetwarzanie ruchów myszy nad siatką stołu w celu dynamicznego wyznaczania rodzaju zakładu (Split, Corner, Six Line itp.)
  const handleMouseMoveOnGrid = (e: React.MouseEvent<SVGRectElement>, col: number, row: number) => {
    if (spinning) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const localX = e.clientX - rect.left;
    const localY = e.clientY - rect.top;
    
    const triggerMargin = 12; // Margines tolerancji w pikselach przy krawędzi komórki

    const isLeft = localX < triggerMargin;
    const isRight = localX > CELL_W - triggerMargin;
    const isTop = localY < triggerMargin;
    const isBottom = localY > CELL_H - triggerMargin;

    // 1. Obsługa narożników (Corners) - przecięcia czterech sąsiednich pól
    if (isLeft && isTop && col > 0 && row > 0) {
      setHoveredBetKey(`corner-${col - 1}-${row - 1}`);
      return;
    }
    if (isRight && isTop && col < 11 && row > 0) {
      setHoveredBetKey(`corner-${col}-${row - 1}`);
      return;
    }
    if (isLeft && isBottom && col > 0 && row < 2) {
      setHoveredBetKey(`corner-${col - 1}-${row}`);
      return;
    }
    if (isRight && isBottom && col < 11 && row < 2) {
      setHoveredBetKey(`corner-${col}-${row}`);
      return;
    }

    // 2. Obsługa linii szóstkowej (Six Line) na krawędziach dolnej/górnej między pionowymi kolumnami
    if (isBottom && row === 2) {
      if (isLeft && col > 0) {
        setHoveredBetKey(`sixline-${col - 1}`);
        return;
      }
      if (isRight && col < 11) {
        setHoveredBetKey(`sixline-${col}`);
        return;
      }
    }
    if (isTop && row === 0) {
      if (isLeft && col > 0) {
        setHoveredBetKey(`sixline-${col - 1}`);
        return;
      }
      if (isRight && col < 11) {
        setHoveredBetKey(`sixline-${col}`);
        return;
      }
    }

    // 3. Obsługa podziałów (Splits) - linie graniczne między dwiema liczbami
    if (isLeft) {
      if (col === 0) {
        setHoveredBetKey(`split-zero-${row}`);
      } else {
        setHoveredBetKey(`split-h-${col - 1}-${row}`);
      }
      return;
    }
    if (isRight) {
      if (col < 11) {
        setHoveredBetKey(`split-h-${col}-${row}`);
      }
      return;
    }
    if (isTop && row > 0) {
      setHoveredBetKey(`split-v-${col}-${row - 1}`);
      return;
    }
    if (isBottom && row < 2) {
      setHoveredBetKey(`split-v-${col}-${row}`);
      return;
    }

    // 4. Domyślnie zwykłe pojedyncze pole (Straight Up)
    const currentNum = BOARD_LAYOUT[row][col].value;
    setHoveredBetKey(`straight-${currentNum}`);
  };

  // Uruchomienie spinu ruletki
  const handleSpin = () => {
    if (spinning) return;
    
    if (totalBetAmount === 0) {
      alert("Najpierw postaw zakłady na stole!");
      return;
    }

    // Zablokowanie stołu i rozpoczęcie animacji
    setSpinning(true);
    setShowResultModal(false);

    // Losowanie zwycięskiego przedziału
    const winningIdx = Math.floor(Math.random() * WHEEL_NUMBERS.length);
    const winningItem = WHEEL_NUMBERS[winningIdx];
    
    // Parametry animacji
    const animationDuration = 5000; // Czas trwania pełnego spinu w ms
    const startTime = performance.now();
    const startWheelAngle = wheelAngle % 360;
    const startBallAngle = ballAngle % 360;
    
    // Kąt pojedynczego przedziału koła
    const stepAngle = 360 / WHEEL_NUMBERS.length;
    // Zwycięski przedział na obracającym się kole
    const winningPocketAngle = winningIdx * stepAngle;
    
    // Obliczenie końcowego kąta koła, by wygrany przedział wylądował dokładnie pod wskaźnikiem (0 stopni na samej górze)
    // wheelRotationTarget = 360 * pełne_obroty - kąt_kieszeni
    const fullWheelRotations = 6;
    const targetWheelAngle = startWheelAngle + 360 * fullWheelRotations - winningPocketAngle;

    // Funkcje wygaszania (Easing functions)
    const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / animationDuration, 1);

      // 1. Obliczenie bieżącego obrotu koła
      const currentWheelAngle = startWheelAngle + (targetWheelAngle - startWheelAngle) * easeOutCubic(progress);
      setWheelAngle(currentWheelAngle);

      // 2. Obliczenie bieżącej pozycji kulki (kręci się przeciwnie do wskazówek zegara)
      let currentBallAngle = 0;
      let currentBallRadius = 180;

      if (progress < 0.75) {
        // Faza 1: Kulka kręci się szybko na zewnętrznym torze koła
        const phaseProgress = progress / 0.75;
        const totalBallRotations = 9;
        currentBallAngle = startBallAngle - totalBallRotations * 360 * Math.pow(phaseProgress, 0.7);
        currentBallRadius = 180 + Math.sin(progress * 100) * 1.5; // Delikatne nieregularne drgania toru
      } else if (progress < 0.90) {
        // Faza 2: Kulka zwalnia i spiralnie schodzi do przedziałów kieszeni
        const phaseProgress = (progress - 0.75) / 0.15;
        const startR = 180;
        const endR = 138;
        currentBallRadius = startR - (startR - endR) * phaseProgress;

        const totalBallRotations = 9;
        const ballAnglePhase1End = startBallAngle - totalBallRotations * 360;
        
        // Kąt wylądowania na obracającym się kole w fazie 3
        const targetAngleAtPhase3Start = winningPocketAngle + (startWheelAngle + (targetWheelAngle - startWheelAngle) * easeOutCubic(0.9));
        currentBallAngle = ballAnglePhase1End + (targetAngleAtPhase3Start - ballAnglePhase1End) * phaseProgress;
      } else {
        // Faza 3: Kulka bezpiecznie wylądowała w kieszeni i obraca się razem z kołem
        currentBallRadius = 138;
        const currentWheelAngleAtT = startWheelAngle + (targetWheelAngle - startWheelAngle) * easeOutCubic(progress);
        currentBallAngle = winningPocketAngle + currentWheelAngleAtT;

        // Dynamiczne odbicie kulki w kieszeni przy zderzeniu z separatorem (pierwsze 5% tej fazy)
        if (progress < 0.94) {
          const bounceProgress = (progress - 0.90) / 0.04;
          currentBallRadius += Math.sin(bounceProgress * Math.PI) * 4.5;
        }
      }

      setBallAngle(currentBallAngle);
      setBallRadius(currentBallRadius);

      if (progress < 1) {
        animationFrameId.current = requestAnimationFrame(animate);
      } else {
        // Zakończenie animacji - rozliczenie i odblokowanie gry
        setSpinning(false);
        
        // Obliczenie wygranej z zakładów
        let totalWin = 0;
        Object.entries(bets).forEach(([betKey, betValue]) => {
          const coveredNums = getTargetedNumbers(betKey);
          if (coveredNums.includes(winningItem.value)) {
            // Mnożniki wygranych
            if (betKey.startsWith("straight-")) {
              totalWin += betValue * 36;
            } else if (betKey.startsWith("split-")) {
              totalWin += betValue * 18;
            } else if (betKey.startsWith("corner-")) {
              totalWin += betValue * 9;
            } else if (betKey.startsWith("sixline-")) {
              totalWin += betValue * 6;
            } else if (betKey.startsWith("column-") || betKey.startsWith("dozen-")) {
              totalWin += betValue * 3;
            } else {
              // Zakłady zewnętrzne proste 1:1
              totalWin += betValue * 2;
            }
          }
        });

        // Wypłata tokenów na konto gracza
        setBalance(prev => prev + totalWin);
        
        // Zapamiętanie wylosowanej liczby
        setHistory(prev => [winningItem, ...prev.slice(0, 4)]);
        setPayoutInfo({
          totalBet: totalBetAmount,
          winAmount: totalWin,
          winningNum: winningItem
        });
        
        // Wyczyszczenie zakładów i pokazanie okna z podsumowaniem
        setBets({});
        setShowResultModal(true);
      }
    };

    animationFrameId.current = requestAnimationFrame(animate);
  };

  // Sprzątanie referencji animacji po odmontowaniu
  useEffect(() => {
    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, []);

  // Obliczenie współrzędnych kulki na ekranie (środek koła w 250, 250)
  const ballX = 250 + ballRadius * Math.cos(ballAngle * Math.PI / 180);
  const ballY = 250 + ballRadius * Math.sin(ballAngle * Math.PI / 180);

  // Lista aktualnie podświetlonych pól podczas hoverowania stołu
  const highlightedNumbers = hoveredBetKey ? getTargetedNumbers(hoveredBetKey) : [];

  return (
    <div className={`page-content ${styles.rouletteContainer}`}>
      
      {/* Nagłówek */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px" }}>
        <div>
          <h1 style={{ fontSize: "36px", color: "#79BAFC", fontFamily: "Poppins, sans-serif", margin: 0 }}>Ruletka Królewska</h1>
          <p style={{ margin: "5px 0 0", color: "#888", fontSize: "14px" }}>Poczuj emocje luksusowego, prawdziwego kasyna 3D</p>
        </div>
      </div>

      {/* Główna sekcja gry (Koło z lewej strony, Stół z prawej) */}
      <div style={{ display: "flex", flexDirection: "row", flexWrap: "wrap", gap: "30px", justifyContent: "center" }}>
        
        {/* LEWA STRONA: KOŁO RULETKI 3D */}
        <div style={{ flex: "0 1 480px", textAlign: "center", background: "#111", padding: "20px", borderRadius: "20px", border: "1px solid #292929" }}>
          
          <svg viewBox="0 0 500 500" width="100%" height="auto" style={{ maxWidth: "440px", filter: "drop-shadow(0px 15px 25px rgba(0,0,0,0.8))" }}>
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
            <circle cx="250" cy="250" r="185" fill="none" stroke="#252528" strokeWidth="6" />
            <circle cx="250" cy="250" r="182" fill="none" stroke="#0d0d0f" strokeWidth="2" />

            {/* 3. OBRACAJĄCY SIĘ RDZEŃ KOŁA */}
            <g transform={`rotate(${wheelAngle}, 250, 250)`}>
              {/* Czarna tarcza bazowa przedziałów */}
              <circle cx="250" cy="250" r="172" fill="#0d0d10" />

              {/* Rysowanie wycinków kieszeni (pockets) */}
              {WHEEL_NUMBERS.map((item, i) => {
                const step = 360 / WHEEL_NUMBERS.length;
                const startA = i * step;
                const endA = (i + 1) * step;
                const midA = startA + step / 2;
                
                // Pozycja cyfry na tarczy
                const textPos = {
                  x: 250 + 148 * Math.cos((midA - 90) * Math.PI / 180),
                  y: 250 + 148 * Math.sin((midA - 90) * Math.PI / 180)
                };

                return (
                  <g key={i}>
                    {/* Wycinek koła wypełniony kolorem przedziału */}
                    <path
                      d={describeArc(250, 250, 172, startA, endA)}
                      fill={item.color === "red" ? "#cc0000" : item.color === "black" ? "#1e1e1e" : "#008000"}
                      stroke="url(#goldGrad)"
                      strokeWidth="0.8"
                    />
                    
                    {/* Nakładka cieniująca kieszeń dla efektu 3D */}
                    <path
                      d={describeArc(250, 250, 172, startA, endA)}
                      fill="url(#pocketShadow)"
                    />
                    
                    {/* Wyświetlanie numeru kieszeni z odpowiednim obróceniem do środka */}
                    <text
                      x={textPos.x}
                      y={textPos.y}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fill="#ffffff"
                      fontSize="11"
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
              <circle cx="250" cy="250" r="128" fill="none" stroke="url(#goldGrad)" strokeWidth="3.5" />
              
              {/* Stożkowy środek wrzeciona */}
              <circle cx="250" cy="250" r="126" fill="#1c1d22" />
              <circle cx="250" cy="250" r="60" fill="url(#spindleGold)" stroke="url(#goldGrad)" strokeWidth="1.5" />
              <circle cx="250" cy="250" r="40" fill="url(#chromeGrad)" stroke="#666666" strokeWidth="0.8" />
              
              {/* Cztery ramiona/uchwyty wrzeciona ruletki (spindle handles) */}
              {[0, 90, 180, 270].map((deg) => {
                const angleRad = (deg - 90) * Math.PI / 180;
                const spokeEndX = 250 + 55 * Math.cos(angleRad);
                const spokeEndY = 250 + 55 * Math.sin(angleRad);
                return (
                  <g key={deg}>
                    {/* Chromowane ramię */}
                    <line
                      x1="250"
                      y1="250"
                      x2={spokeEndX}
                      y2={spokeEndY}
                      stroke="url(#chromeGrad)"
                      strokeWidth="6"
                      strokeLinecap="round"
                    />
                    {/* Złota ozdobna gałka na końcu ramienia */}
                    <circle
                      cx={spokeEndX}
                      cy={spokeEndY}
                      r="8"
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
                const lineAngle = i * step;
                const rad = (lineAngle - 90) * Math.PI / 180;
                
                // Linia biegnąca od wrzeciona (r=60) do zewnętrznej krawędzi kieszeni (r=172)
                const x1 = 250 + 60 * Math.cos(rad);
                const y1 = 250 + 60 * Math.sin(rad);
                const x2 = 250 + 172 * Math.cos(rad);
                const y2 = 250 + 172 * Math.sin(rad);
                
                return (
                  <line
                    key={`divider-${i}`}
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke="url(#goldGrad)"
                    strokeWidth="1.2"
                    opacity="0.9"
                  />
                );
              })}
              
              {/* Środkowy nit wrzeciona */}
              <circle cx="250" cy="250" r="12" fill="url(#chromeGrad)" />
              <circle cx="250" cy="250" r="6" fill="#0c0c0e" />
            </g>

            {/* Przeszkody w kształcie rombów (deflektory) na nieruchomym torze kulki */}
            {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => {
              const rad = (deg - 90) * Math.PI / 180;
              const cx = 250 + 196 * Math.cos(rad);
              const cy = 250 + 196 * Math.sin(rad);
              
              return (
                <g key={`deflector-${deg}`} transform={`rotate(${deg}, ${cx}, ${cy})`} filter="drop-shadow(0px 2px 3px rgba(0,0,0,0.65))">
                  {/* Trójwymiarowy, cieniowany złoty rombik (lewa strona ciemniejsza, prawa jaśniejsza) */}
                  <polygon
                    points={`${cx - 5},${cy} ${cx},${cy - 8} ${cx},${cy + 8}`}
                    fill="#aa7c11"
                    stroke="#594008"
                    strokeWidth="0.5"
                  />
                  <polygon
                    points={`${cx + 5},${cy} ${cx},${cy - 8} ${cx},${cy + 8}`}
                    fill="url(#goldGrad)"
                    stroke="#594008"
                    strokeWidth="0.5"
                  />
                </g>
              );
            })}

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
          <div style={{ marginTop: "20px" }}>
            <span style={{ fontSize: "13px", color: "#888", textTransform: "uppercase", letterSpacing: "1px" }}>Ostatnie 5 liczb:</span>
            <div style={{ display: "flex", gap: "8px", justifyContent: "center", marginTop: "8px" }}>
              {history.length === 0 ? (
                <div style={{ fontSize: "14px", color: "#555", fontStyle: "italic" }}>Brak historii</div>
              ) : (
                history.map((num, idx) => (
                  <div
                    key={idx}
                    style={{
                      width: "36px",
                      height: "36px",
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "14px",
                      fontWeight: "bold",
                      color: "#fff",
                      background: num.color === "red" ? "#cc0000" : num.color === "black" ? "#222222" : "#008000",
                      border: "2px solid rgba(255,255,255,0.15)",
                      boxShadow: "0 3px 6px rgba(0,0,0,0.3)"
                    }}
                  >
                    {num.value}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* PRAWA STRONA: ZIELONY STÓŁ ZAKŁADOWY (FELT TABLE) */}
        <div style={{ flex: "1 1 700px", minWidth: "300px", background: "#0b3d1b", padding: "20px", borderRadius: "20px", border: "4px solid #d4af37", boxShadow: "inset 0 0 50px rgba(0,0,0,0.8), 0 10px 30px rgba(0,0,0,0.5)" }}>
          
          <div style={{ overflowX: "auto" }}>
            <svg viewBox="0 0 920 340" width="100%" height="auto" style={{ display: "block", margin: "0 auto" }}>
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
                onClick={() => handlePlaceBet("straight-0")}
                onContextMenu={(e) => handleRemoveBet(e, "straight-0")}
                onMouseEnter={() => setHoveredBetKey("straight-0")}
                onMouseLeave={() => setHoveredBetKey(null)}
                className={styles.pointer}
              >
                <path
                  d="M 70 10 L 70 205 L 10 107.5 Z"
                  fill={highlightedNumbers.includes(0) ? "rgba(255,255,255,0.25)" : "#0c5921"}
                  stroke="#d4af37"
                  strokeWidth="2.5"
                  filter={hoveredBetKey === "straight-0" ? "url(#hoverGlow)" : "none"}
                />
                <text
                  x="45"
                  y="107.5"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="#ffffff"
                  fontSize="22"
                  fontWeight="bold"
                  fontFamily="Poppins, sans-serif"
                >
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
                        x={x}
                        y={y}
                        width={CELL_W}
                        height={CELL_H}
                        fill={isCellHighlighted ? "rgba(255,255,255,0.25)" : num.color === "red" ? "#b31e1e" : "#1a1a1a"}
                        stroke="#d4af37"
                        strokeWidth="1.5"
                      />
                      
                      {/* Niewidzialna komórka detekcji precyzyjnych zakładów na krawędziach (Split, Corner, Six Line itp.) */}
                      <rect
                        x={x}
                        y={y}
                        width={CELL_W}
                        height={CELL_H}
                        fill="transparent"
                        className={styles.pointer}
                        onMouseMove={(e) => handleMouseMoveOnGrid(e, colIndex, rowIndex)}
                        onMouseLeave={() => setHoveredBetKey(null)}
                        onClick={() => hoveredBetKey && handlePlaceBet(hoveredBetKey)}
                        onContextMenu={(e) => {
                          e.preventDefault();
                          if (hoveredBetKey) handleRemoveBet(e, hoveredBetKey);
                        }}
                      />

                      {/* Numer liczby stołu (Wyświetlanie) - Przepuszczalny dla myszy */}
                      <text
                        x={x + CELL_W / 2}
                        y={y + CELL_H / 2}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fill="#ffffff"
                        fontSize="18"
                        fontWeight="bold"
                        fontFamily="Poppins, sans-serif"
                        pointerEvents="none"
                      >
                        {num.value}
                      </text>
                    </g>
                  );
                })
              )}

              {/* 3. PRZYCISKI KOLUMN "2:1" (Rzędów) po prawej stronie stołu */}
              {BOARD_LAYOUT.map((_, rowIndex) => {
                const x = 70 + 12 * CELL_W;
                const y = 10 + rowIndex * CELL_H;
                const betKey = `column-${rowIndex}`;
                const isColumnHighlighted = hoveredBetKey === betKey;

                return (
                  <g
                    key={`col-${rowIndex}`}
                    onClick={() => handlePlaceBet(betKey)}
                    onContextMenu={(e) => handleRemoveBet(e, betKey)}
                    onMouseEnter={() => setHoveredBetKey(betKey)}
                    onMouseLeave={() => setHoveredBetKey(null)}
                    className={styles.pointer}
                  >
                    <rect
                      x={x}
                      y={y}
                      width={CELL_W}
                      height={CELL_H}
                      fill={isColumnHighlighted ? "rgba(255,255,255,0.2)" : "#082612"}
                      stroke="#d4af37"
                      strokeWidth="2"
                    />
                    <text
                      x={x + CELL_W / 2}
                      y={y + CELL_H / 2}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fill="#d4af37"
                      fontSize="14"
                      fontWeight="bold"
                      fontFamily="Poppins, sans-serif"
                    >
                      2:1
                    </text>
                  </g>
                );
              })}

              {/* 4. SEKCJA TUZINÓW (Dozens) */}
              {[
                { label: "1sze 12", idx: 1 },
                { label: "2gie 12", idx: 2 },
                { label: "3cie 12", idx: 3 }
              ].map((dozen, i) => {
                const x = 70 + i * (CELL_W * 4);
                const y = 205;
                const betKey = `dozen-${dozen.idx}`;
                const isDozenHighlighted = hoveredBetKey === betKey;

                return (
                  <g
                    key={`dozen-${i}`}
                    onClick={() => handlePlaceBet(betKey)}
                    onContextMenu={(e) => handleRemoveBet(e, betKey)}
                    onMouseEnter={() => setHoveredBetKey(betKey)}
                    onMouseLeave={() => setHoveredBetKey(null)}
                    className={styles.pointer}
                  >
                    <rect
                      x={x}
                      y={y}
                      width={CELL_W * 4}
                      height={45}
                      fill={isDozenHighlighted ? "rgba(255,255,255,0.2)" : "#082612"}
                      stroke="#d4af37"
                      strokeWidth="2"
                    />
                    <text
                      x={x + (CELL_W * 4) / 2}
                      y={y + 22.5}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fill="#ffffff"
                      fontSize="13"
                      fontWeight="bold"
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
                    onClick={() => handlePlaceBet(bet.key)}
                    onContextMenu={(e) => handleRemoveBet(e, bet.key)}
                    onMouseEnter={() => setHoveredBetKey(bet.key)}
                    onMouseLeave={() => setHoveredBetKey(null)}
                    className={styles.pointer}
                  >
                    <rect
                      x={x}
                      y={y}
                      width={CELL_W * 2}
                      height={45}
                      fill={
                        isHighlighted 
                          ? "rgba(255,255,255,0.2)" 
                          : bet.color === "red" 
                          ? "#b31e1e" 
                          : bet.color === "black" 
                          ? "#1a1a1a" 
                          : "#082612"
                      }
                      stroke="#d4af37"
                      strokeWidth="2"
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
                        x={x + CELL_W}
                        y={y + 22.5}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fill="#ffffff"
                        fontSize="13"
                        fontWeight="bold"
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
                let cx = 0;
                let cy = 0;

                // Obliczanie współrzędnych geometrycznych żetonów na podstawie klucza zakładu
                if (betKey === "straight-0") {
                  cx = 45;
                  cy = 107.5;
                } else if (betKey.startsWith("straight-")) {
                  const numVal = parseInt(betKey.replace("straight-", ""), 10);
                  // Znalezienie współrzędnych komórki liczby w BOARD_LAYOUT
                  let foundRow = 0, foundCol = 0;
                  BOARD_LAYOUT.forEach((row, r) => {
                    row.forEach((item, c) => {
                      if (item.value === numVal) {
                        foundRow = r;
                        foundCol = c;
                      }
                    });
                  });
                  cx = 70 + foundCol * CELL_W + CELL_W / 2;
                  cy = 10 + foundRow * CELL_H + CELL_H / 2;
                } else if (betKey.startsWith("split-h-")) {
                  const parts = betKey.replace("split-h-", "").split("-");
                  const col = parseInt(parts[0], 10);
                  const row = parseInt(parts[1], 10);
                  cx = 70 + (col + 1) * CELL_W;
                  cy = 10 + row * CELL_H + CELL_H / 2;
                } else if (betKey.startsWith("split-v-")) {
                  const parts = betKey.replace("split-v-", "").split("-");
                  const col = parseInt(parts[0], 10);
                  const row = parseInt(parts[1], 10);
                  cx = 70 + col * CELL_W + CELL_W / 2;
                  cy = 10 + (row + 1) * CELL_H;
                } else if (betKey.startsWith("split-zero-")) {
                  const row = parseInt(betKey.replace("split-zero-", ""), 10);
                  cx = 70;
                  cy = 10 + row * CELL_H + CELL_H / 2;
                } else if (betKey.startsWith("corner-")) {
                  const parts = betKey.replace("corner-", "").split("-");
                  const col = parseInt(parts[0], 10);
                  const row = parseInt(parts[1], 10);
                  cx = 70 + (col + 1) * CELL_W;
                  cy = 10 + (row + 1) * CELL_H;
                } else if (betKey.startsWith("sixline-")) {
                  const col = parseInt(betKey.replace("sixline-", ""), 10);
                  cx = 70 + (col + 1) * CELL_W;
                  cy = 205;
                } else if (betKey.startsWith("column-")) {
                  const row = parseInt(betKey.replace("column-", ""), 10);
                  cx = 70 + 12 * CELL_W + CELL_W / 2;
                  cy = 10 + row * CELL_H + CELL_H / 2;
                } else if (betKey.startsWith("dozen-")) {
                  const idx = parseInt(betKey.replace("dozen-", ""), 10);
                  cx = 70 + (idx - 1) * (CELL_W * 4) + (CELL_W * 4) / 2;
                  cy = 227.5;
                } else if (betKey === "outside-low") {
                  cx = 70 + CELL_W; cy = 272.5;
                } else if (betKey === "outside-even") {
                  cx = 70 + CELL_W * 3; cy = 272.5;
                } else if (betKey === "outside-red") {
                  cx = 70 + CELL_W * 5; cy = 272.5;
                } else if (betKey === "outside-black") {
                  cx = 70 + CELL_W * 7; cy = 272.5;
                } else if (betKey === "outside-odd") {
                  cx = 70 + CELL_W * 9; cy = 272.5;
                } else if (betKey === "outside-high") {
                  cx = 70 + CELL_W * 11; cy = 272.5;
                }

                // Przyporządkowanie koloru żetonu na podstawie łącznej kwoty na polu
                let chipColor = "#ffffff";
                const chipNominalList = [50, 20, 10, 5, 2, 1];
                for (const nominal of chipNominalList) {
                  if (betValue >= nominal) {
                    chipColor = CHIP_COLORS[nominal];
                    break;
                  }
                }

                return (
                  <g key={betKey} filter="url(#chipShadow)" className={styles.peNone}>
                    {/* Korpus żetonu */}
                    <circle
                      cx={cx}
                      cy={cy}
                      r="16"
                      fill={chipNominalList[0] === 50 && betValue >= 50 ? "url(#goldChipGrad)" : chipColor}
                      stroke="#ffffff"
                      strokeWidth="1.5"
                    />
                    
                    {/* Wewnętrzny ozdobny okrąg żetonu w prążki */}
                    <circle
                      cx={cx}
                      cy={cy}
                      r="12"
                      fill="none"
                      stroke="#ffffff"
                      strokeWidth="1"
                      strokeDasharray="3,3"
                      opacity="0.85"
                    />
                    
                    {/* Wyświetlana wartość zakładu na żetonie */}
                    <text
                      x={cx}
                      y={cy}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fill={chipColor === "#ffffff" ? "#111" : "#fff"}
                      fontSize="9.5"
                      fontWeight="bold"
                      fontFamily="Poppins, sans-serif"
                    >
                      {betValue}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* PASEK KONTROLI ZAKŁADÓW (WYBÓR NOMINAŁÓW I AKCJE) */}
          <div style={{ display: "flex", flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", marginTop: "20px", gap: "15px" }}>
            
            {/* Wybór nominału żetonu */}
            <div>
              <span style={{ display: "block", fontSize: "12px", color: "#8bcf9a", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "8px", fontWeight: 700 }}>Nominał Żetonu:</span>
              <div style={{ display: "flex", gap: "8px" }}>
                {[1, 2, 5, 10, 20, 50].map((nominal) => {
                  const isSelected = selectedChip === nominal;
                  const chipColor = CHIP_COLORS[nominal];
                  return (
                    <button
                      key={nominal}
                      onClick={() => setSelectedChip(nominal)}
                      style={{
                        margin: 0,
                        width: "42px",
                        height: "42px",
                        borderRadius: "50%",
                        border: isSelected ? "3px solid #fff" : "1.5px solid rgba(255,255,255,0.4)",
                        background: nominal === 50 ? "linear-gradient(135deg, #ffd700, #b39700)" : chipColor,
                        color: nominal === 1 ? "#111" : "#fff",
                        fontWeight: "bold",
                        fontSize: "14px",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        boxShadow: isSelected ? "0 0 15px rgba(255,255,255,0.6)" : "0 4px 6px rgba(0,0,0,0.3)",
                        transform: isSelected ? "scale(1.15)" : "scale(1)",
                        transition: "all 0.2s ease"
                      }}
                    >
                      {nominal}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Przyciski pomocnicze: Wyczyść */}
            <div style={{ display: "flex", gap: "10px" }}>
              <button
                onClick={handleClearBets}
                disabled={spinning}
                style={{
                  margin: 0,
                  background: "rgba(220, 53, 69, 0.2)",
                  color: "#ff6b7b",
                  border: "1.5px solid #dc3545",
                  padding: "10px 18px",
                  fontSize: "13px",
                  fontWeight: "bold",
                  borderRadius: "10px",
                  cursor: spinning ? "not-allowed" : "pointer",
                  transition: "all 0.2s"
                }}
                onMouseEnter={(e) => !spinning && (e.currentTarget.style.background = "#dc3545", e.currentTarget.style.color = "#fff")}
                onMouseLeave={(e) => !spinning && (e.currentTarget.style.background = "rgba(220, 53, 69, 0.2)", e.currentTarget.style.color = "#ff6b7b")}
              >
                Wyczyść
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* DZIELONY PRZYCISK: ZAKRĘĆ KOŁEM */}
      <div style={{ textAlign: "center", marginTop: "40px" }}>
        <div style={{ fontSize: "16px", color: "#aaa", marginBottom: "12px", fontFamily: "Poppins, sans-serif" }}>
          Suma na stole: <span style={{ color: "#d4af37", fontWeight: "bold", fontSize: "20px" }}>{totalBetAmount} 🪙</span>
        </div>
        <button
          onClick={handleSpin}
          disabled={spinning || totalBetAmount === 0}
          style={{
            margin: "0 auto",
            display: "inline-block",
            background: "linear-gradient(135deg, #ffd700, #ff8c00)",
            color: "#000",
            border: "none",
            padding: "18px 60px",
            fontSize: "22px",
            fontWeight: "bold",
            borderRadius: "18px",
            cursor: spinning || totalBetAmount === 0 ? "not-allowed" : "pointer",
            boxShadow: spinning || totalBetAmount === 0 ? "none" : "0 8px 25px rgba(255, 140, 0, 0.4)",
            transform: spinning ? "scale(0.98)" : "scale(1)",
            transition: "all 0.2s ease",
            opacity: spinning || totalBetAmount === 0 ? 0.6 : 1,
            letterSpacing: "1px",
            textTransform: "uppercase"
          }}
          onMouseEnter={(e) => !spinning && totalBetAmount > 0 && (e.currentTarget.style.boxShadow = "0 10px 30px rgba(255, 140, 0, 0.65)", e.currentTarget.style.transform = "scale(1.04)")}
          onMouseLeave={(e) => !spinning && totalBetAmount > 0 && (e.currentTarget.style.boxShadow = "0 8px 25px rgba(255, 140, 0, 0.4)", e.currentTarget.style.transform = "scale(1)")}
        >
          {spinning ? "Losowanie..." : "Zakręć kołem!"}
        </button>
        <p style={{ marginTop: "15px", color: "#666", fontSize: "13px" }}>
          * Kliknij lewym przyciskiem, aby postawić żeton. Użyj prawego przycisku myszy na polu, aby go zdjąć.
        </p>
      </div>

      {/* POPUP Z WYNIKIEM SPINU (VICTORY MODAL) */}
      {showResultModal && payoutInfo.winningNum && (
        <div className="modal" style={{ backdropFilter: "blur(5px)" }}>
          <div
            className="modal-content"
            style={{
              background: "#0d0d0f",
              padding: "40px",
              borderRadius: "24px",
              border: payoutInfo.winAmount > 0 ? "3px solid #ffd700" : "3px solid #555",
              boxShadow: payoutInfo.winAmount > 0 ? "0 0 50px rgba(255, 215, 0, 0.35)" : "0 10px 40px rgba(0,0,0,0.8)",
              maxWidth: "400px",
              width: "90%"
            }}
          >
            {payoutInfo.winAmount > 0 ? (
              <h2 style={{ color: "#ffd700", fontSize: "32px", margin: "0 0 10px", fontFamily: "Poppins, sans-serif" }}>WYGRANA!</h2>
            ) : (
              <h2 style={{ color: "#aaa", fontSize: "28px", margin: "0 0 10px", fontFamily: "Poppins, sans-serif" }}>Koniec rundy</h2>
            )}

            <p style={{ color: "#888", fontSize: "14px", margin: "0 0 25px" }}>Wylosowano liczbę:</p>
            
            {/* Wyświetlenie wylosowanej liczby */}
            <div style={{ display: "flex", justifyContent: "center", marginBottom: "30px" }}>
              <div
                style={{
                  width: "90px",
                  height: "90px",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "38px",
                  fontWeight: "bold",
                  color: "#fff",
                  background: payoutInfo.winningNum.color === "red" ? "#cc0000" : payoutInfo.winningNum.color === "black" ? "#222222" : "#008000",
                  border: "4px solid rgba(255, 255, 255, 0.25)",
                  boxShadow: "0 10px 20px rgba(0,0,0,0.5)",
                  transform: "scale(1.15)"
                }}
              >
                {payoutInfo.winningNum.value}
              </div>
            </div>

            <div style={{ background: "rgba(255,255,255,0.03)", padding: "18px", borderRadius: "14px", border: "1px solid #222", marginBottom: "25px", textAlign: "left" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
                <span style={{ color: "#888", fontSize: "14px" }}>Łączny zakład:</span>
                <span style={{ fontWeight: "bold", color: "#fff", fontSize: "15px" }}>{payoutInfo.totalBet} 🪙</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#888", fontSize: "14px" }}>Wypłata:</span>
                <span style={{ fontWeight: "bold", color: payoutInfo.winAmount > 0 ? "#ffd700" : "#ff4d4d", fontSize: "18px" }}>
                  {payoutInfo.winAmount > 0 ? `+${payoutInfo.winAmount}` : "0"} 🪙
                </span>
              </div>
            </div>

            <button
              onClick={() => setShowResultModal(false)}
              style={{
                margin: "0 auto",
                display: "block",
                background: payoutInfo.winAmount > 0 ? "linear-gradient(135deg, #ffd700, #ff8c00)" : "#fff",
                color: "#000",
                border: "none",
                padding: "12px 40px",
                fontSize: "16px",
                fontWeight: "bold",
                borderRadius: "12px",
                cursor: "pointer",
                width: "100%",
                boxShadow: payoutInfo.winAmount > 0 ? "0 5px 15px rgba(255,140,0,0.3)" : "none",
                transition: "all 0.2s"
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-2px)")}
              onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
            >
              Graj Dalej
            </button>
          </div>
        </div>
      )}

    </div>
  );
};