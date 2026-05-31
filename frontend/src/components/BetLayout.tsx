import React, { useState, useRef } from "react";
import type { ChangeEvent } from "react";
import { formatBalance } from "../utils/format.ts";

// 1. Definiujemy interfejs dla propsów
interface BetLayoutProps {
    bet: number;
    setBet: React.Dispatch<React.SetStateAction<number>>; // Typ pasujący idealnie do standardowego useState
}

// 2. Przekazujemy interfejs do React.FC i destrukturyzujemy propsy
export const BetLayout: React.FC<BetLayoutProps> = ({ bet, setBet }) => {
    // Stan isEditing zostaje lokalnie, bo interesuje tylko ten konkretny input
    const [isEditing, setIsEditing] = useState<boolean>(false);

    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const getStep = (currentBet: number): number => {
        if (currentBet <= 0) return 100;
        return Math.max(100, Math.pow(10, Math.floor(Math.log10(currentBet)) - 1));
    };

    const handleModifyBet = (direction: "increment" | "decrement") => {
        setBet((prev) => {
            const step = getStep(prev);
            if (direction === "increment") {
                return prev + step;
            } else {
                const nextValue = prev - step;
                return nextValue < 0 ? 0 : nextValue;
            }
        });
    };

    const startTimer = (direction: "increment" | "decrement") => {
        if (timerRef.current) return;

        handleModifyBet(direction);

        timerRef.current = setInterval(() => {
            handleModifyBet(direction);
        }, 150);
    };

    const stopTimer = () => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
    };

    const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
        const val = Number(event.target.value);
        setBet(isNaN(val) || val < 0 ? 0 : val);
    };

    return (
        <div className="bet-layout">
            <button
                className="change-bet"
                onMouseDown={() => startTimer("decrement")}
                onMouseUp={stopTimer}
                onMouseLeave={stopTimer}
                onTouchStart={() => startTimer("decrement")}
                onTouchEnd={stopTimer}
            >
                -
            </button>

            <input
                type={isEditing ? "number" : "text"}
                name="bet"
                placeholder="Kwota"
                min={0}
                value={isEditing ? (bet === 0 ? "" : bet) : formatBalance(bet)}
                onChange={handleInputChange}
                onFocus={() => setIsEditing(true)}
                onBlur={() => setIsEditing(false)}
            />

            <button
                className="change-bet"
                onMouseDown={() => startTimer("increment")}
                onMouseUp={stopTimer}
                onMouseLeave={stopTimer}
                onTouchStart={() => startTimer("increment")}
                onTouchEnd={stopTimer}
            >
                +
            </button>
        </div>
    );
};