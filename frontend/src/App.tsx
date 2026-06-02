import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { useState, useEffect } from "react"
import { MainLayout } from "./layout/MainLayout.tsx"
import { ProtectedRoute } from "./components/ProtectedRoute.tsx"

// Importy kontenerów autoryzacji
import { LoginContainer } from "./pages/LoginContainer.tsx"
import { RegisterContainer } from "./pages/RegisterContainer.tsx" // Upewnij się, że masz ten plik w pages!
import { Profile } from "./components/Profile.tsx"
import { Home } from "./pages/Home.tsx"
import Slots from "./pages/Slots.tsx"
import { Roulette } from "./pages/Roulette"
import { Scratch } from "./pages/Scratch.tsx"
import { About } from "./footer-pages/About.tsx"
import { Mission } from "./footer-pages/Mission.tsx"
import { Contact } from "./footer-pages/Contact.tsx"
import { Team } from "./footer-pages/Team.tsx"
import { ResponsibleGaming } from "./footer-pages/ResponsibleGaming.tsx"
import { Terms } from "./footer-pages/Terms.tsx"
import { Help } from "./footer-pages/Help.tsx"

import "./App.css"

export const App = () => {
  // Sprawdzamy przy uruchomieniu aplikacji, czy token istnieje w pamięci podręcznej
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem("token") !== null;
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token && isAuthenticated) {
      setIsAuthenticated(false);
    }
  }, [isAuthenticated]);

  return (
    <BrowserRouter>
      <Routes>
        {/* ========================================================================= */}
        {/* ŚCIEŻKI PUBLICZNE (Dostępne BEZ logowania)                                */}
        {/* ========================================================================= */}
        <Route path="/login" element={
          isAuthenticated ? <Navigate to="/" replace /> : <LoginContainer setIsAuthenticated={setIsAuthenticated} />
        } />
        <Route path="/regulamin" element={<Terms />} />

        {/* TUTAJ BYŁ BŁĄD - DODAJEMY PUBLICZNĄ ŚCIEŻKĘ REJESTRACJI */}
        <Route path="/register" element={
          isAuthenticated ? <Navigate to="/" replace /> : <RegisterContainer onSwitchToLogin={() => window.location.href = "/login"} />
        } />

        {/* ========================================================================= */}
        {/* ŚCIEŻKI PRYWATNE (Wymagają zalogowania - ProtectedRoute)                   */}
        {/* ========================================================================= */}
        <Route element={<ProtectedRoute isAuthenticated={isAuthenticated} />}>

          {/* Główny layout kasyna (paski boczne, navbar, stan żetonów) */}
          <Route element={<MainLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/sloty" element={<Slots />} />
            <Route path="/ruletka" element={<Roulette />} />
            <Route path="/zdrapki" element={<Scratch />} />
            <Route path="/profil" element={<Profile />} />

            {/* Pozostałe ścieżki */}
            <Route path="/o-nas" element={<About />} />
            <Route path="/misja" element={<Mission />} />
            <Route path="/kontakt" element={<Contact />} />
            <Route path="/zespol" element={<Team />} />
            <Route path="/odpowiedzialna-gra" element={<ResponsibleGaming />} />
            <Route path="/pomoc" element={<Help />} />
          </Route>

        </Route>

        {/* Catch-all: Jeśli ścieżka nie istnieje, przekieruj na główną */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}