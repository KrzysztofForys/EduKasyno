import { BrowserRouter, Routes, Route } from "react-router-dom"
import { useState } from "react"
import { MainLayout } from "./layout/MainLayout.tsx"

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
import "./App.css"

export const App = () => {
  const [tokens, setTokens] = useState<number>(1000)
  return (
    <BrowserRouter>
      <Routes>

        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/sloty" element={<Slots />} />
          <Route path="/ruletka" element={<Roulette balance={tokens} setBalance={setTokens} />} />
          <Route path="/zdrapki" element={<Scratch balance={tokens} setBalance={setTokens} />} />

          {/* Nowe ścieżki - Dodane */}
          <Route path="/o-nas" element={<About />} />
          <Route path="/misja" element={<Mission />} />
          <Route path="/kontakt" element={<Contact />} />
          <Route path="/zespol" element={<Team />} />
          <Route path="/odpowiedzialna-gra" element={<ResponsibleGaming />} />
          <Route path="/regulamin" element={<Terms />} />
          <Route path="/pomoc" element={<Help />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}