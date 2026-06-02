// Typy i stałe współdzielone przez komponenty ruletki

// Definicja typów dla koloru pól w ruletce
export type RouletteColor = "black" | "red" | "green";

// Definicja pojedynczego numeru w ruletce
export type RouletteNumber = {
  value: number;
  color: RouletteColor;
};

// Definicja właściwości wejściowych komponentu ruletki
export type RouletteProps = {
  balance: number;
  setBalance: React.Dispatch<React.SetStateAction<number>>;
};

// Informacje o wypłacie po rundzie
export type PayoutInfo = {
  totalBet: number;
  winAmount: number;
  winningNum: RouletteNumber | null;
};

// Rozmiary komórek siatki liczb stołu bukmacherskiego
export const CELL_W = 65;
export const CELL_H = 65;

// Lista liczb na kole ruletki w standardowym układzie europejskim (od 0 do 36)
export const WHEEL_NUMBERS: RouletteNumber[] = [
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
export const BOARD_LAYOUT: RouletteNumber[][] = [
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
export const CHIP_COLORS: Record<number, string> = {
  1: "#ffffff",   // biały
  2: "#ff4d4d",   // czerwony
  5: "#3399ff",   // niebieski
  10: "#33cc66",  // zielony
  20: "#1a1a1a",  // czarny
  50: "#ffd700"   // złoty
};

// Lista kolorów tła z plików SVG żetonów do zamazywania środka przy niestandardowych kwotach
export const SVG_CHIP_COLORS: Record<number, string> = {
  1: "#ffffff",
  2: "#d6c31f",
  5: "#d62828",
  10: "#2563eb",
  20: "#16a34a",
  50: "#1a1a1a"
};
