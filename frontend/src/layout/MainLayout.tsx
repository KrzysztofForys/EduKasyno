import { Outlet } from "react-router-dom"
import Navbar from "../components/Navbar.tsx"
import { Footer } from "../components/Footer.tsx"
import { useBalance } from "../context/BalanceContext.tsx"

export const MainLayout = () => {
  const { balance } = useBalance()
  return (
    <div className="layout-container">
      <Navbar balance={balance} />

      <main>
        <Outlet />
      </main>

      <Footer />
    </div>
  )
}

export default MainLayout