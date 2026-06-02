import React, { useEffect, useState, useRef } from "react";
import styles from "./SlotReel.module.css"; // Zachowane Twoje style modułowe

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
    targetSymbol: string; // NOWOŚĆ: przekazujemy wylosowany symbol z serwera
    onStop: () => void; // Zmienione na czyste powiadomienie o zatrzymaniu bębna
};

export const SlotReel: React.FC<ReelProps> = ({ spinning, stopDelay, targetSymbol, onStop }) => {
    const [currentSymbol, setCurrentSymbol] = useState<string>(SYMBOLS[0]);
    const [isAnimating, setIsAnimating] = useState<boolean>(false);
    const [targetIndex, setTargetIndex] = useState<number>(0);

    // Zachowana Twoja długa lista elementów do iluzji kręcenia
    const [reelStrip, setReelStrip] = useState<string[]>([]);
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Budowanie Twojej oryginalnej taśmy bębna
    const generateStrip = (finalSymbolIndex: number) => {
        const repeats = 10; 
        const strip: string[] = [];

        for (let i = 0; i < repeats; i++) {
            strip.push(...SYMBOLS);
        }

        // Na samym końcu taśmy ustawiamy symbol, który dostaliśmy z serwera
        strip.push(SYMBOLS[finalSymbolIndex]);
        return strip;
    };

    useEffect(() => {
        if (spinning && targetSymbol) {
            setIsAnimating(true);

            // 1. Znajdujemy indeks symbolu, który przesłał backend
            let symbolIndex = SYMBOLS.indexOf(targetSymbol);
            if (symbolIndex === -1) symbolIndex = 0; // fallback w razie literówki

            // 2. Generujemy taśmę kończącą się na tym konkretnym symbolu
            const newStrip = generateStrip(symbolIndex);
            setReelStrip(newStrip);
            setTargetIndex(newStrip.length - 1);

            // 3. Obliczamy całkowity czas (Twoje 1500ms + opóźnienie)
            const totalDuration = 1500 + stopDelay;

            // 4. Czekamy na zakończenie zjazdu taśmy
            timeoutRef.current = setTimeout(() => {
                setIsAnimating(false);
                setCurrentSymbol(targetSymbol);
                onStop(); // Informujemy Slots.tsx, że bęben skończył bieg
            }, totalDuration);
        }

        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, [spinning, stopDelay, targetSymbol]);

    // Twój oryginalny styl odpowiedzialny za ruch taśmy w pionie o 150px
    const getReelStyle = () => {
        if (!isAnimating) {
            return { transform: "translateY(0px)" };
        }

        const duration = 1500 + stopDelay;
        const translateValue = targetIndex * 150; // Twoje 150px wysokości elementu

        return {
            transform: `translateY(-${translateValue}px)`,
            transition: `transform ${duration}ms cubic-bezier(0.25, 1, 0.35, 1)`
        };
    };

    return (
        <div className={styles.reelContainer}>
            <div className={styles.reelWindow}>
                <div className={styles.reelStrip} style={getReelStyle()}>
                    {isAnimating ? (
                        // Render Twojej długiej taśmy podczas animacji
                        reelStrip.map((symbol, idx) => (
                            <div className={styles.slotTile} key={idx}>
                                <img src={`/${symbol}.png`} alt={symbol} />
                            </div>
                        ))
                    ) : (
                        // Wyświetlenie pojedynczego kafelka po zatrzymaniu
                        <div className={styles.slotTile}>
                            <img src={`/${currentSymbol}.png`} alt={currentSymbol} />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};