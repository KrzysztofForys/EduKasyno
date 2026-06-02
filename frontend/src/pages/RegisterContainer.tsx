import { useState } from "react";

interface RegisterContainerProps {
  onSwitchToLogin: () => void;
}

export const RegisterContainer: React.FC<RegisterContainerProps> = ({ onSwitchToLogin }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
          login: email,
          haslo: password,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        alert("Konto utworzone pomyślnie! Dostajesz 5000 PLN na start. Możesz się teraz zalogować.");
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
    <div style={{ maxWidth: "400px", margin: "100px auto", padding: "20px", background: "#1e1e1e", borderRadius: "8px", color: "white", fontFamily: "sans-serif" }}>
      <h2>Zarejestruj się</h2>
      <p style={{ color: "#aaa", fontSize: "14px" }}>Załóż konto i odbierz 5000 PLN na start!</p>
      
      {error && <div style={{ background: "#dc3545", padding: "10px", borderRadius: "4px", marginBottom: "15px" }}>{error}</div>}

      <form onSubmit={handleRegisterSubmit} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
          <label>E-mail:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ padding: "10px", borderRadius: "4px", background: "#333", color: "white", border: "1px solid #444" }}
            placeholder="np. gracz@edukasyno.pl"
            required
          />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
          <label>Hasło:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ padding: "10px", borderRadius: "4px", background: "#333", color: "white", border: "1px solid #444" }}
            placeholder="Min. 6 znaków"
            required
          />
        </div>
        <button type="submit" disabled={isLoading} style={{ padding: "12px", background: "#28a745", color: "white", border: "none", borderRadius: "4px", fontWeight: "bold", cursor: "pointer" }}>
          {isLoading ? "Tworzenie konta..." : "Zarejestruj się"}
        </button>
      </form>
      <p style={{ textAlign: "center", marginTop: "15px", fontSize: "14px" }}>
        Masz już konto? <span onClick={onSwitchToLogin} style={{ color: "#007bff", cursor: "pointer", fontWeight: "bold" }}>Zaloguj się</span>
      </p>
    </div>
  );
};