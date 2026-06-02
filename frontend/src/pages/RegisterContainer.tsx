import { useState } from "react";
import { RegisterForm } from "../components/RegisterForm";
import type { RegisterFormData } from "../types/types";

interface RegisterContainerProps {
  onSwitchToLogin: () => void;
}

export const RegisterContainer: React.FC<RegisterContainerProps> = ({ onSwitchToLogin }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRegisterSubmit = async (formData: RegisterFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("http://localhost:3001/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        // MAPOWANIE: Wysyłamy email jako 'login', żeby backend zapisał go w bazie
        body: JSON.stringify({
          login: formData.email,
          haslo: formData.password,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        alert("Konto utworzone pomyślnie! Dostajesz 10000 żetonów na start. Możesz się teraz zalogować.");
        onSwitchToLogin(); // Przełączamy widok na logowanie
      } else {
        setError(data.message || "Błąd podczas rejestracji.");
      }
    } catch (err) {
      console.error(err);
      setError("Błąd połączenia z serwerem.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", background: "#0f0f0f" }}>
      <RegisterForm
        onSubmit={handleRegisterSubmit}
        isLoading={isLoading}
        externalErrors={error ? { form: error } : undefined}
        onSwitchToLogin={onSwitchToLogin}
      />
    </div>
  );
};