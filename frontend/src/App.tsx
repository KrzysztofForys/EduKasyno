import { BrowserRouter, Routes, Route } from "react-router-dom"
import { useState } from "react"
import {MainLayout} from "./layout/MainLayout.tsx"

import {Home} from "./pages/Home.tsx"
import Slots from "./pages/Slots.tsx"
import {Roulette} from "./pages/Roulette"
import {Scratch} from "./pages/Scratch.tsx"
import "./App.css"

export const App = () => {
  const [tokens, setTokens] = useState<number>(1000)
  return (
    <BrowserRouter>
      <Routes>

          <Route element={<MainLayout balance={tokens}/>}>
          <Route path="/" element={<Home />} />
          <Route path="/sloty" element={<Slots balance={tokens} setBalance={setTokens}/>} />
          <Route path="/ruletka" element={<Roulette />} />
          <Route path="/zdrapki" element={<Scratch balance={tokens} setBalance={setTokens}/>} />
          
          {/* Nowe ścieżki - na razie puste */}
          {/* <Route path="/o-nas" element={<About />} />
          <Route path="/misja" element={<Mission />} />
          <Route path="/zespol" element={<Team />} />
          <Route path="/kontakt" element={<Contact />} />
          <Route path="/odpowiedzialna-gra" element={<ResponsibleGaming />} />
          <Route path="/regulamin" element={<Terms />} />
          <Route path="/pomoc" element={<Help />} /> */}
        </Route>
      </Routes>
    </BrowserRouter>
  )
}