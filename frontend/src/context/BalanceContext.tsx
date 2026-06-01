import { createContext, useState, useContext, useEffect, type ReactNode } from 'react';

interface BalanceContextType {
    balance: number;
    tryToChangeBalance: (amount: number) => boolean;
    refreshBalance: () => Promise<void>;
}

const BalanceContext = createContext<BalanceContextType | undefined>(undefined);

interface BalanceProviderProps {
    children: ReactNode;
}

export const BalanceProvider = ({ children }: BalanceProviderProps) => {
    const [balance, setBalance] = useState<number>(0);

    const refreshBalance = async () => {
        const token = localStorage.getItem("token");
        if (!token) return;

        try {
            const res = await fetch("http://localhost:3001/api/profile", {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });
            if (res.ok) {
                const data = await res.json();
                setBalance(data.saldo); 
            }
        } catch (err) {
            console.error("Błąd Contextu przy pobieraniu salda:", err);
        }
    };

    useEffect(() => {
        refreshBalance();
    }, []);

    const tryToChangeBalance = (amount: number): boolean => {
        const token = localStorage.getItem("token");
        if (!token) {
            alert("Musisz być zalogowany!");
            return false;
        }

        if (balance + amount >= 0) {
            setBalance((prevBalance) => prevBalance + amount);
            return true;
        } else {
            alert("Brak środków na koncie!");
            return false;
        }
    };

    return (
        <BalanceContext.Provider value={{ balance, tryToChangeBalance, refreshBalance }}>
            {children}
        </BalanceContext.Provider>
    );
};

export const useBalance = () => {
    const context = useContext(BalanceContext);
    if (!context) {
        throw new Error('useBalance must be used within a BalanceProvider');
    }
    return context;
};