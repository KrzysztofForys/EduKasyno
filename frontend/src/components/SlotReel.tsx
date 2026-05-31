import React, { useEffect, useState, useRef } from "react";
import styles from "./SlotReel.module.css"; // Import modułowy

const SYMBOLS = [
    "cytryna",
    "siedem",
    "winogrono",
    "bar",
    "pomarancza",
    "czeresnia",
    "arbuz",
];

type ReelProps = {
    spinning: boolean;
    stopDelay: number;
    onStop: (symbol: string) => void;
};

export const SlotReel: React.FC<ReelProps> = ({ spinning, stopDelay, onStop }) => {
    const [currentSymbol, setCurrentSymbol] = useState<string>(SYMBOLS[0]);
    const [isAnimating, setIsAnimating] = useState<boolean>(false);
    const [targetIndex, setTargetIndex] = useState<number>(0);

    // Tworzymy długą listę elementów do animacji, aby stworzyć iluzję kręcenia
    const [reelStrip, setReelStrip] = useState<string[]>([]);
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Budowanie taśmy bębna (mieszamy symbole wielokrotnie)
    const generateStrip = (finalSymbolIndex: number) => {
        const repeats = 10; // Im więcej, tym dłuższy dystans przejedzie bęben
        const strip: string[] = [];

        for (let i = 0; i < repeats; i++) {
            strip.push(...SYMBOLS);
        }

        // Na samym końcu taśmy ustawiamy nasz wylosowany symbol
        strip.push(SYMBOLS[finalSymbolIndex]);
        return strip;
    };

    useEffect(() => {
        if (spinning) {
            setIsAnimating(true);

            // 1. Losujemy zwycięski symbol dla tego bębna
            const randomIndex = Math.floor(Math.random() * SYMBOLS.length);
            const chosenSymbol = SYMBOLS[randomIndex];

            // 2. Generujemy taśmę, która skończy się na wylosowanym elemencie
            const newStrip = generateStrip(randomIndex);
            setReelStrip(newStrip);
            setTargetIndex(newStrip.length - 1);

            // 3. Obliczamy całkowity czas: baza 1500ms + opóźnienie tego konkretnego bębna
            const totalDuration = 1500 + stopDelay;

            // 4. Czekamy na zakończenie animacji
            timeoutRef.current = setTimeout(() => {
                setIsAnimating(false);
                setCurrentSymbol(chosenSymbol);
                onStop(chosenSymbol); // Wysyłamy informację do rodzica
            }, totalDuration);
        }

        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, [spinning, stopDelay]);

    // Styl odpowiedzialny za ruch taśmy w pionie
    const getReelStyle = () => {
        if (!isAnimating) {
            return { transform: "translateY(0px)" };
        }

        const duration = 1500 + stopDelay;
        // Każdy element ma wysokość np. 150px (zdefiniowane w CSS)
        const translateValue = targetIndex * 150;

        return {
            transform: `translateY(-${translateValue}px)`,
            transition: `transform ${duration}ms cubic-bezier(0.25, 1, 0.35, 1)`
            // cubic-bezier odpowiada za start z kopyta i bardzo płynne wyhamowanie na końcu
        };
    };

    return (
        <div className={styles.reelContainer}>
            <div className={styles.reelWindow}>
                <div className={styles.reelStrip} style={getReelStyle()}>
                    {isAnimating ? (
                        // Podczas kręcenia renderujemy wygenerowaną długą taśmę
                        reelStrip.map((symbol, idx) => (
                            <div className={styles.slotTile} key={idx}>
                                <img src={`/${symbol}.png`} alt={symbol} />
                            </div>
                        ))
                    ) : (
                        // Gdy bęben stoi, pokazujemy tylko jeden, aktualny symbol
                        <div className={styles.slotTile}>
                            <img src={`/${currentSymbol}.png`} alt={currentSymbol} />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};