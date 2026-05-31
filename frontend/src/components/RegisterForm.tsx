import React, { useState } from 'react';
import type { RegisterFormData, RegisterErrors } from '../types/types';
import styles from './LoginForm.module.css'; // Współdzielimy ten sam plik CSS!

interface RegisterFormProps {
    onSubmit: (data: RegisterFormData) => Promise<void>;
    isLoading: boolean;
    externalErrors?: RegisterErrors;
    onSwitchToLogin: () => void;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({
    onSubmit,
    isLoading,
    externalErrors,
    onSwitchToLogin,
}) => {
    const [formData, setFormData] = useState<RegisterFormData>({
        email: '',
        password: '',
        confirmPassword: '',
        acceptTerms: false,
    });

    const [errors, setErrors] = useState<RegisterErrors>({});

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));

        if (errors[name as keyof RegisterErrors]) {
            setErrors((prev) => ({ ...prev, [name]: undefined }));
        }
    };

    const validateForm = (): boolean => {
        const localErrors: RegisterErrors = {};
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

        if (formData.password !== formData.confirmPassword) {
            localErrors.confirmPassword = 'Hasła nie są identyczne.';
        }

        if (!formData.acceptTerms) {
            localErrors.acceptTerms = 'Musisz zaakceptować regulamin.';
        }

        setErrors(localErrors);
        return Object.keys(localErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (validateForm() && !isLoading) {
            await onSubmit(formData);
        }
    };

    const combinedErrors = { ...errors, ...externalErrors };

    return (
        <div className={styles.loginCard}>
            <div className={styles.loginHeader}>
                <h2 className={styles.loginHeaderTitle}>Zarejestruj się</h2>
                <p className={styles.loginSubtitle}>Stwórz darmowe konto i zgarnij bonus startowy</p>
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

                <div className={styles.formGroup}>
                    <label htmlFor="confirmPassword" className={styles.formGroupLabel}>Powtórz hasło</label>
                    <input
                        type="password"
                        id="confirmPassword"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className={`${styles.formInput} ${combinedErrors.confirmPassword ? styles.inputError : ''}`}
                        placeholder="••••••••"
                        disabled={isLoading}
                    />
                    {combinedErrors.confirmPassword && <span className={styles.errorText}>{combinedErrors.confirmPassword}</span>}
                </div>

                <div className={styles.formGroup}>
                    <label className={styles.checkboxContainer}>
                        <input
                            type="checkbox"
                            name="acceptTerms"
                            checked={formData.acceptTerms}
                            onChange={handleChange}
                            disabled={isLoading}
                        />
                        <span className={styles.checkmark}></span>
                        <span>Akceptuję <a href="/regulamin" target="_blank" rel="noreferrer" className={styles.forgotPasswordLink}>Regulamin</a> oraz politykę prywatności</span>
                    </label>
                    {combinedErrors.acceptTerms && <span className={styles.errorText}>{combinedErrors.acceptTerms}</span>}
                </div>

                <button type="submit" className={styles.btnLogin} disabled={isLoading}>
                    {isLoading ? <div className={styles.spinner}></div> : 'Utwórz konto'}
                </button>

                <div style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                    Masz już konto?{' '}
                    <span
                        onClick={onSwitchToLogin}
                        className={styles.forgotPasswordLink}
                        style={{ cursor: 'pointer', fontWeight: 'bold' }}
                    >
                        Zaloguj się
                    </span>
                </div>
            </form>
        </div>
    );
};