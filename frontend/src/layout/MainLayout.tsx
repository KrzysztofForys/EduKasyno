import { Outlet } from "react-router-dom"
import Navbar from "../components/Navbar.tsx"
import { Footer } from "../components/Footer.tsx"

export const MainLayout = () => {
  return (
    <div className="layout-container">
      <Navbar />

      <main>
        <Outlet />
      </main>

      <Footer />
    </div>
  )
}

export default MainLayout