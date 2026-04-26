import { useEffect, useState } from "react";

const symbols = [
  "cytryna",
  "siedem",
  "winogrono",
  "bar",
  "pomarancza",
  "czeresnia"
];

type ReelProps = {
  spinning: boolean;
  stopDelay: number; // ← zmiana nazwy (ważne!)
  onStop: (symbol: string) => void;
};

export const Reel = ({ spinning, stopDelay, onStop }: ReelProps) => {
  const [offset, setOffset] = useState(0);

  const ITEM_HEIGHT = 220;

  useEffect(() => {
    if (!spinning) return;

    let position = 0;

    // stała prędkość
    const interval = setInterval(() => {
      position += ITEM_HEIGHT;
      setOffset(position);
    }, 80);

    // zatrzymanie
    const stopTimeout = setTimeout(() => {
      clearInterval(interval);

      const random = symbols[Math.floor(Math.random() * symbols.length)];
      const index = symbols.indexOf(random);

      // przesuwanie
      setOffset(index * ITEM_HEIGHT);

      onStop(random);
    }, 1500 + stopDelay); // różne zatrzymywanie

    return () => {
      clearInterval(interval);
      clearTimeout(stopTimeout);
    };
  }, [spinning]);

  return (
    <div className="slot-machine__slot">
      <div
        className="reel-inner"
        style={{
          transform: `translateY(-${offset}px)`
        }}
      >
        {[...symbols, ...symbols, ...symbols].map((symbol, i) => (
          <img key={i} src={`${symbol}.png`} />
        ))}
      </div>
    </div>
  );
};