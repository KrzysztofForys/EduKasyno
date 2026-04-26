import { Outlet } from "react-router-dom"
import Navbar from "../components/Navbar.tsx"
import {Footer} from "../components/Footer.tsx"
type MainLayoutProps = {
  balance: number
}
export const MainLayout = ({balance}: MainLayoutProps) => {
  return (
    <div className="layout-container">
      <Navbar balance={balance}/>

      <main>
        <Outlet />
      </main>

      <Footer />
    </div>
  )
}

export default MainLayout