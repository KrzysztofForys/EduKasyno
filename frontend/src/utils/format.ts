/**
 * Formatuję dużą liczbę na czytelny skrót (np. 1230 -> 1.23k, 1500000 -> 1.5M)
 * @param value - liczba do sformatowania
 * @returns sformatowany ciąg znaków
 */
export const formatBalance = (value: number): string => {
    return new Intl.NumberFormat('en-US', {
        notation: 'compact',
        compactDisplay: 'short',
        maximumFractionDigits: 2 // maksymalnie 2 miejsca po przecinku (np. 1.23k)
    }).format(value);
};