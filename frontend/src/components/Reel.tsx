import { useEffect, useRef, useState } from "react";

const symbols = [
  "cytryna",
  "siedem",
  "winogrono",
  "bar",
  "pomarancza",
  "czeresnia"
];
const weightedSymbols = [
    "cytryna","cytryna","cytryna","cytryna","cytryna","cytryna",
    "czeresnia","czeresnia","czeresnia","czeresnia",
    "pomarancza","pomarancza","pomarancza",
    "winogrono","winogrono","winogrono",
    "arbuz","arbuz",
    "bar",
    "siedem"
];

type ReelProps = {
  spinning: boolean;
  stopDelay: number;
  onStop: (symbol: string) => void;
};

export const Reel = ({ spinning, stopDelay, onStop }: ReelProps) => {
  const [offset, setOffset] = useState(0);
  const [reelSymbols, setReelSymbols] = useState<string[]>([]);
  const [stopping, setStopping] = useState(false);

  const isFirstRender = useRef(true);

  const ITEM_HEIGHT = 220;

  // 🔀 generowanie taśmy + poprawny start
  useEffect(() => {
    const generated = generateReel();
    setReelSymbols(generated);

    const randomIndex = Math.floor(Math.random() * generated.length);
    const safeIndex = randomIndex % symbols.length;

    setOffset(safeIndex * ITEM_HEIGHT);
  }, []);

  // 🎰 spin
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    if (!spinning || reelSymbols.length === 0) return;

    let position = offset % (reelSymbols.length * ITEM_HEIGHT);
    setStopping(false);

    const interval = setInterval(() => {
      position = (position + ITEM_HEIGHT) % (reelSymbols.length * ITEM_HEIGHT);
      setOffset(position);
    }, 80);

    const stopTimeout = setTimeout(() => {
      clearInterval(interval);

      const random = weightedSymbols[Math.floor(Math.random() * weightedSymbols.length)];

      const possibleIndexes = reelSymbols
        .map((s, i) => (s === random ? i : null))
        .filter(i => i !== null) as number[];

      const index =
        possibleIndexes[
          Math.floor(Math.random() * possibleIndexes.length)
        ];

      // 🎯 bezpieczne zatrzymanie (bez wyjścia poza zakres)
      const extraSpins = 10;
      const totalItems = reelSymbols.length;

      const safeIndex =
        (index + extraSpins * symbols.length) % totalItems;

      setStopping(true);
      setOffset(safeIndex * ITEM_HEIGHT);

      onStop(random);
    }, 1500 + stopDelay);

    return () => {
      clearInterval(interval);
      clearTimeout(stopTimeout);
    };
  }, [spinning, reelSymbols]);

  // 🔀 shuffle
  const shuffle = (array: string[]) => {
    return [...array].sort(() => Math.random() - 0.5);
  };

  // 🎡 generowanie taśmy
  const generateReel = () => {
    let result: string[] = [];

    for (let i = 0; i < 10; i++) {
      result = [...result, ...shuffle(symbols)];
    }

    return result;
  };

  return (
    <div className="slot-machine__slot">
      <div
        className={`reel-inner ${stopping ? "stopping" : ""}`}
        style={{
          transform: `translateY(-${offset}px)`
        }}
      >
        {reelSymbols.map((symbol, i) => (
          <img key={i} src={`${symbol}.png`} />
        ))}
      </div>
    </div>
  );
};