import { createContext, useState, useContext, type ReactNode } from 'react';

// 1. Definiujemy, co dokładnie będzie przechowywane w kontekście
interface BalanceContextType {
    balance: number;
    tryToChangeBalance: (amount: number) => boolean;
}

// 2. Tworzymy kontekst z domyślną wartością undefined
const BalanceContext = createContext<BalanceContextType | undefined>(undefined);

// 3. Typujemy propsy dla Providera (musi przyjmować dzieci jako ReactNode)
interface BalanceProviderProps {
    children: ReactNode;
}

export const BalanceProvider = ({ children }: BalanceProviderProps) => {
    const [balance, setBalance] = useState<number>(10000);

    const tryToChangeBalance = (amount: number): boolean => {
        {/*amount is negative - check if we have enough money*/ }
        {/*we need to add database check if someone change balance via dev tools*/ }
        if (balance + amount >= 0) {
            setBalance((prevBalance) => prevBalance + amount);
            return true;
        } else {
            alert("Brak środków!");
            return false;
        }

    };

    return (
        <BalanceContext.Provider value={{ balance, tryToChangeBalance }}>
            {children}
        </BalanceContext.Provider>
    );
};

// 4. Własny hook z zabezpieczeniem przed użyciem poza Providerem
export const useBalance = () => {
    const context = useContext(BalanceContext);
    if (!context) {
        throw new Error('useBalance must be used within a BalanceProvider');
    }
    return context;
};