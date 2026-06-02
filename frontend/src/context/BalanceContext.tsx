import { createContext, useState, useContext, useEffect, type ReactNode } from 'react';

interface BalanceContextType {
    balance: number;
    setBalance: (amount: number) => void;
    updateBalance: (newBalance: number) => void;
    tryToChangeBalance: (amount: number) => boolean;
    refreshBalance: () => Promise<void>;
}

const BalanceContext = createContext<BalanceContextType | undefined>(undefined);

interface BalanceProviderProps {
    children: ReactNode;
}

export const BalanceProvider = ({ children }: BalanceProviderProps) => {
    const [balance, setBalance] = useState<number>(0);
    const updateBalance = (newBalance: number) => {
        setBalance(newBalance);
    };
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
                setBalance(Number(data.saldo));
            }
        } catch (err) {
            console.error("Błąd pobierania salda z bazy:", err);
        }
    };

    useEffect(() => {
        refreshBalance();
    }, []);

    // Ta funkcja służy teraz WYŁĄCZNIE do szybkiej weryfikacji na froncie, czy użytkownik ma za co grać
    const tryToChangeBalance = (amount: number): boolean => {
        if (balance + amount >= 0) {
            return true;
        } else {
            alert("Brak wystarczającej ilości żetonów na koncie!");
            return false;
        }
    };

    return (
        <BalanceContext.Provider value={{ balance, updateBalance, setBalance, tryToChangeBalance, refreshBalance }}>
            {children}
        </BalanceContext.Provider>
    );
};

export const useBalance = () => {
    const context = useContext(BalanceContext);
    if (!context) {
        throw new Error("useBalance must be used within a BalanceProvider");
    }
    return context;
};