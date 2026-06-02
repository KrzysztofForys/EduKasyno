import { useState } from "react";
import { useNavigate } from "react-router-dom"; // <- DODANY IMPORT DO ROUTINGU
import { LoginForm } from "../components/LoginForm"; // Upewnij się, że ścieżka do LoginForm jest poprawna
import type { LoginFormData, LoginErrors } from "../types/types";

interface LoginContainerProps {
  setIsAuthenticated: (value: boolean) => void;
}

export const LoginContainer: React.FC<LoginContainerProps> = ({ setIsAuthenticated }) => {
  const navigate = useNavigate(); // <- INICJALIZACJA NAWIGACJI
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [externalErrors, setExternalErrors] = useState<LoginErrors>({});

  const handleLoginSubmit = async (formData: LoginFormData) => {
    setIsLoading(true);
    setExternalErrors({});

    try {
      const res = await fetch("http://localhost:3001/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        // MAPOWANIE: zamieniamy formData.email na klucz 'login' dla backendu
        body: JSON.stringify({
          login: formData.email,
          haslo: formData.password,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        // 1. Zapisujemy token i nazwę gracza do pamięci przeglądarki
        localStorage.setItem("token", data.token);
        localStorage.setItem("username", data.login);

        // 2. Zmieniamy stan autoryzacji w App.tsx na true
        setIsAuthenticated(true);
      } else {
        // Jeśli backend zwróci np. błąd 400 z komunikatem "Niepoprawny login lub hasło."
        setExternalErrors({ form: data.message || "Niepoprawny login lub hasło." });
      }
    } catch (error) {
      console.error("Błąd połączenia z backendem:", error);
      setExternalErrors({ form: "Błąd serwera. Upewnij się, że backend na porcie 3001 działa." });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSwitchToRegister = () => {
    // <- TERAZ LINK DZIAŁA I PRZEKIEROWUJE NA REJESTRACJĘ
    navigate("/register"); 
  };

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", background: "#0f0f0f" }}>
      <LoginForm
        onSubmit={handleLoginSubmit}
        isLoading={isLoading}
        externalErrors={externalErrors}
        onSwitchToRegister={handleSwitchToRegister}
      />
    </div>
  );
};