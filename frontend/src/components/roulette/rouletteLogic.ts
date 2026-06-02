// Funkcje pomocnicze logiki ruletki

import { BOARD_LAYOUT, WHEEL_NUMBERS, CELL_W, CELL_H } from "./rouletteTypes";

// Funkcja pomocnicza do rysowania łuków SVG koła ruletki
export function describeArc(cx: number, cy: number, r: number, startAngle: number, endAngle: number): string {
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

// Funkcja zwracająca listę liczb objętych danym zakładem na podstawie unikalnego klucza zakładu
export function getTargetedNumbers(betKey: string): number[] {
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
    return [BOARD_LAYOUT[row][col].value, BOARD_LAYOUT[row][col + 1].value];
  }

  // Zakład na parę w pionie (Vertical Split)
  if (betKey.startsWith("split-v-")) {
    const parts = betKey.replace("split-v-", "").split("-");
    const col = parseInt(parts[0], 10);
    const row = parseInt(parts[1], 10);
    return [BOARD_LAYOUT[row][col].value, BOARD_LAYOUT[row + 1][col].value];
  }

  // Zakład na parę z zerem (Zero Split)
  if (betKey.startsWith("split-zero-")) {
    const row = parseInt(betKey.replace("split-zero-", ""), 10);
    return [0, BOARD_LAYOUT[row][0].value];
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
    const idx = parseInt(betKey.replace("dozen-", ""), 10);
    const start = (idx - 1) * 12 + 1;
    const end = idx * 12;
    const nums: number[] = [];
    for (let i = start; i <= end; i++) nums.push(i);
    return nums;
  }

  // Zakłady zewnętrzne proste
  if (betKey === "outside-red") return WHEEL_NUMBERS.filter(n => n.color === "red").map(n => n.value);
  if (betKey === "outside-black") return WHEEL_NUMBERS.filter(n => n.color === "black").map(n => n.value);
  if (betKey === "outside-even") return Array.from({ length: 36 }, (_, i) => i + 1).filter(n => n % 2 === 0);
  if (betKey === "outside-odd") return Array.from({ length: 36 }, (_, i) => i + 1).filter(n => n % 2 !== 0);
  if (betKey === "outside-low") return Array.from({ length: 18 }, (_, i) => i + 1);
  if (betKey === "outside-high") return Array.from({ length: 18 }, (_, i) => i + 19);

  return [];
}

// Obliczanie współrzędnych geometrycznych żetonu na stole na podstawie klucza zakładu
export function getChipCoords(betKey: string): { cx: number; cy: number } {
  let cx = 0;
  let cy = 0;

  if (betKey === "straight-0") {
    cx = 45; cy = 107.5;
  } else if (betKey.startsWith("straight-")) {
    const numVal = parseInt(betKey.replace("straight-", ""), 10);
    let foundRow = 0, foundCol = 0;
    BOARD_LAYOUT.forEach((row, r) => {
      row.forEach((item, c) => {
        if (item.value === numVal) { foundRow = r; foundCol = c; }
      });
    });
    cx = 70 + foundCol * CELL_W + CELL_W / 2;
    cy = 10 + foundRow * CELL_H + CELL_H / 2;
  } else if (betKey.startsWith("split-h-")) {
    const parts = betKey.replace("split-h-", "").split("-");
    cx = 70 + (parseInt(parts[0], 10) + 1) * CELL_W;
    cy = 10 + parseInt(parts[1], 10) * CELL_H + CELL_H / 2;
  } else if (betKey.startsWith("split-v-")) {
    const parts = betKey.replace("split-v-", "").split("-");
    cx = 70 + parseInt(parts[0], 10) * CELL_W + CELL_W / 2;
    cy = 10 + (parseInt(parts[1], 10) + 1) * CELL_H;
  } else if (betKey.startsWith("split-zero-")) {
    const row = parseInt(betKey.replace("split-zero-", ""), 10);
    cx = 70;
    cy = 10 + row * CELL_H + CELL_H / 2;
  } else if (betKey.startsWith("corner-")) {
    const parts = betKey.replace("corner-", "").split("-");
    cx = 70 + (parseInt(parts[0], 10) + 1) * CELL_W;
    cy = 10 + (parseInt(parts[1], 10) + 1) * CELL_H;
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
  } else if (betKey === "outside-low")   { cx = 70 + CELL_W;      cy = 272.5; }
  else if (betKey === "outside-even")    { cx = 70 + CELL_W * 3;  cy = 272.5; }
  else if (betKey === "outside-red")     { cx = 70 + CELL_W * 5;  cy = 272.5; }
  else if (betKey === "outside-black")   { cx = 70 + CELL_W * 7;  cy = 272.5; }
  else if (betKey === "outside-odd")     { cx = 70 + CELL_W * 9;  cy = 272.5; }
  else if (betKey === "outside-high")    { cx = 70 + CELL_W * 11; cy = 272.5; }

  return { cx, cy };
}
