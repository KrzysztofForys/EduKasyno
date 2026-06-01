import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { useState } from "react"
import { MainLayout } from "./layout/MainLayout.tsx"
import { ProtectedRoute } from "./components/ProtectedRoute.tsx"

// Import kontenera logowania
import { LoginContainer } from "./pages/LoginContainer.tsx"

import { Home } from "./pages/Home.tsx"
import Slots from "./pages/Slots.tsx"
import { Roulette } from "./pages/Roulette"
import { Scratch } from "./pages/Scratch.tsx"
import { About } from "./pages/About.tsx"
import { Mission } from "./pages/Mission.tsx"
import { Contact } from "./pages/Contact.tsx"
import { Team } from "./pages/Team.tsx"
import { ResponsibleGaming } from "./pages/ResponsibleGaming.tsx"
import { Terms } from "./pages/Terms.tsx"
import { Help } from "./pages/Help.tsx"
// POPRAWIONY IMPORT PROFILU Z FOLDERU PAGES
import Profile from "./components/Profile.tsx"

import "./App.css"

export const App = () => {
  const [tokens, setTokens] = useState<number>(1000)

  // Stan autoryzacji
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false)

  return (
    <BrowserRouter>
      <Routes>
        {/* Ścieżka publiczna: Ekran logowania */}
        <Route path="/login" element={
          isAuthenticated ? <Navigate to="/" replace /> : <LoginContainer setIsAuthenticated={setIsAuthenticated} />
        } />

        {/* Wszystkie ścieżki poniżej wymagają zalogowania */}
        <Route element={<ProtectedRoute isAuthenticated={isAuthenticated} />}>

          {/* Główny layout kasyna (paski boczne, navbar, stan żetonów) */}
          <Route element={<MainLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/sloty" element={<Slots />} />
            <Route path="/ruletka" element={<Roulette balance={tokens} setBalance={setTokens} />} />
            <Route path="/zdrapki" element={<Scratch />} />
            <Route path="/profil" element={<Profile/>}/>

            {/* Pozostałe ścieżki */}
            <Route path="/o-nas" element={<About />} />
            <Route path="/misja" element={<Mission />} />
            <Route path="/kontakt" element={<Contact />} />
            <Route path="/zespol" element={<Team />} />
            <Route path="/odpowiedzialna-gra" element={<ResponsibleGaming />} />
            <Route path="/regulamin" element={<Terms />} />
            <Route path="/pomoc" element={<Help />} />
          </Route>

        </Route>

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}