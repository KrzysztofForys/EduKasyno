import React, { useState } from 'react';
import type { LoginFormData, LoginErrors } from '../types/types';
import styles from './LoginForm.module.css';
import { useBalance } from "../context/BalanceContext";

interface LoginFormProps {
    onSubmit: (data: LoginFormData) => Promise<void>;
    isLoading: boolean;
    externalErrors?: LoginErrors;
    onSwitchToRegister: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onSubmit, isLoading, externalErrors, onSwitchToRegister }) => {
    const [formData, setFormData] = useState<LoginFormData>({
        email: '',
        password: '',
        rememberMe: false,
    });
      const { balance, refreshBalance } = useBalance();
    const [errors, setErrors] = useState<LoginErrors>({});

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));

        // Czyszczenie błędu danego pola przy pisaniu
        if (errors[name as keyof LoginErrors]) {
            setErrors((prev) => ({ ...prev, [name]: undefined }));
        }
    };

    const validateForm = (): boolean => {
        const localErrors: LoginErrors = {};
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!formData.email) {
            localErrors.email = 'Adres e-mail jest wymagany.';
        } else if (!emailRegex.test(formData.email)) {
            localErrors.email = 'Wprowadź poprawny adres e-mail.';
        }

        if (!formData.password) {
            localErrors.password = 'Hasło jest wymagane.';
        } else if (formData.password.length < 6) {
            localErrors.password = 'Hasło musi mieć co najmniej 6 znaków.';
        }

        setErrors(localErrors);
        return Object.keys(localErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (validateForm() && !isLoading) {
            await onSubmit(formData);
            await refreshBalance();
        }
        
    };

    // Łączymy błędy lokalne z błędami z API
    const combinedErrors = { ...errors, ...externalErrors };

    return (
        <div className={styles.loginCard}>
            <div className={styles.loginHeader}>
                <h2 className={styles.loginHeaderTitle}>Zaloguj się</h2>
                <p className={styles.loginSubtitle}>Wejdź do gry i odbierz darmowe żetony</p>
            </div>

            <form onSubmit={handleSubmit} className={styles.loginForm} noValidate>
                {combinedErrors.form && (
                    <div className={styles.formErrorSummary}>
                        {combinedErrors.form}
                    </div>
                )}

                <div className={styles.formGroup}>
                    <label htmlFor="email" className={styles.formGroupLabel}>E-mail</label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className={`${styles.formInput} ${combinedErrors.email ? styles.inputError : ''}`}
                        placeholder="np. gracz@edukasyno.pl"
                        disabled={isLoading}
                    />
                    {combinedErrors.email && <span className={styles.errorText}>{combinedErrors.email}</span>}
                </div>

                <div className={styles.formGroup}>
                    <label htmlFor="password" className={styles.formGroupLabel}>Hasło</label>
                    <input
                        type="password"
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        className={`${styles.formInput} ${combinedErrors.password ? styles.inputError : ''}`}
                        placeholder="••••••••"
                        disabled={isLoading}
                    />
                    {combinedErrors.password && <span className={styles.errorText}>{combinedErrors.password}</span>}
                </div>

                <div className={styles.formActionsRow}>
                    <label className={styles.checkboxContainer}>
                        <input
                            type="checkbox"
                            name="rememberMe"
                            checked={formData.rememberMe}
                            onChange={handleChange}
                            disabled={isLoading}
                        />
                        <span className={styles.checkmark}></span>
                        Zapamiętaj mnie
                    </label>
                    <a href="#forgot" className={styles.forgotPasswordLink}>Zapomniałeś hasła?</a>
                </div>

                <button type="submit" className={styles.btnLogin} disabled={isLoading}>
                    {isLoading ? <div className={styles.spinner}></div> : 'Zaloguj się'}
                </button>
            </form>
            {/* Dodaj to na samym dole formularza logowania w LoginForm.tsx, przed zamkiem </form> */}
            <div style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                Nie masz konta?{' '}
                <span
                    onClick={onSwitchToRegister} // Musisz przekazać tę funkcję w propsach formularza logowania, analogicznie jak w rejestracji
                    className={styles.forgotPasswordLink}
                    style={{ cursor: 'pointer', fontWeight: 'bold' }}
                >
                    Zarejestruj się
                </span>
            </div>
        </div>
    );
};