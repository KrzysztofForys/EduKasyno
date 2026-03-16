import { Outlet } from "react-router-dom"
import Navbar from "../components/Navbar.tsx"
import {Footer} from "../components/Footer.tsx"

export const MainLayout = () => {
  return (
    <>
      <Navbar />

      <main>
        <Outlet />
      </main>

      <Footer />
    </>
  )
}

export default MainLayout