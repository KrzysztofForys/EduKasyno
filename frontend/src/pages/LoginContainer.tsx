import React, { useState } from 'react';
import { LoginForm } from '../components/LoginForm';
import { RegisterForm } from '../components/RegisterForm'; // Import nowego formularza
import type { LoginFormData, RegisterFormData } from '../types/types';

interface LoginContainerProps {
    setIsAuthenticated: (auth: boolean) => void;
}

export const LoginContainer: React.FC<LoginContainerProps> = ({ setIsAuthenticated }) => {
    // Stan kontrolujący, który formularz aktualnie wyświetlamy
    const [view, setView] = useState<'login' | 'register'>('login');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [apiErrors, setApiErrors] = useState<any>({});

    // Obsługa Logowania
    const handleLoginSubmit = async (data: LoginFormData) => {
        setIsLoading(true);
        setApiErrors({});

        try {
            await new Promise((resolve) => setTimeout(resolve, 1500));
            setIsAuthenticated(true);
        } catch (error) {
            setApiErrors({ form: 'Nieprawidłowy e-mail lub hasło.' });
        } finally {
            setIsLoading(false);
        }
    };

    // Obsługa Rejestracji
    const handleRegisterSubmit = async (data: RegisterFormData) => {
        setIsLoading(true);
        setApiErrors({});

        try {
            // Atrapa zapytania API rejestracji
            await new Promise((resolve) => setTimeout(resolve, 2000));

            console.log('Konto zarejestrowane pomyślnie:', data.email);

            // Po rejestracji możesz automatycznie zalogować użytkownika:
            setIsAuthenticated(true);

            // LUB przełączyć go do logowania z komunikatem sukcesu:
            // setView('login');

        } catch (error) {
            setApiErrors({ form: 'Ten adres e-mail jest już zajęty.' });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '100vh',
            backgroundColor: 'var(--bg-main)',
            padding: '1rem'
        }}>
            {view === 'login' ? (
                <LoginForm
                    onSubmit={handleLoginSubmit}
                    isLoading={isLoading}
                    externalErrors={apiErrors}
                    onSwitchToRegister={() => {
                        setView('register');
                        setApiErrors({});
                    }}
                />
            ) : (
                <RegisterForm
                    onSubmit={handleRegisterSubmit}
                    isLoading={isLoading}
                    externalErrors={apiErrors}
                    onSwitchToLogin={() => {
                        setView('login');
                        setApiErrors({}); // Czyścimy stare błędy przy przełączaniu
                    }}
                />
            )}
        </div>
    );
};