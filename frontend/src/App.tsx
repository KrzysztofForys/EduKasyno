import { BrowserRouter, Routes, Route } from "react-router-dom"
import { MainLayout } from "./layout/MainLayout.tsx"
import { Home } from "./pages/Home.tsx"
import { Slots } from "./pages/Slots.tsx"
import { Roulette } from "./pages/Roulette"
import { Scratch } from "./pages/Scratch.tsx"

import { About } from "./pages/About.tsx"
import { Mission } from "./pages/Mission.tsx"
import { Team } from "./pages/Team.tsx"
import { Contact } from "./pages/Contact.tsx"
import { ResponsibleGaming } from "./pages/ResponsibleGaming.tsx"
import { Terms } from "./pages/Terms.tsx"
import { Help } from "./pages/Help.tsx"

import "./App.css"

export const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/sloty" element={<Slots />} />
          <Route path="/ruletka" element={<Roulette />} />
          <Route path="/zdrapki" element={<Scratch />} />
          
          {/* Nowe ścieżki */}
          <Route path="/o-nas" element={<About />} />
          <Route path="/misja" element={<Mission />} />
          <Route path="/zespol" element={<Team />} />
          <Route path="/kontakt" element={<Contact />} />
          <Route path="/odpowiedzialna-gra" element={<ResponsibleGaming />} />
          <Route path="/regulamin" element={<Terms />} />
          <Route path="/pomoc" element={<Help />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}