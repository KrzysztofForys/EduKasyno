import { Link } from "react-router-dom"
import { useBalance } from "../context/BalanceContext.tsx"
import { formatBalance } from "../utils/format.ts"

export const Navbar = () => {

  const { balance } = useBalance()


  return (
    <header>
      <div className="logo">
        <span>&#127891;</span>
        <strong>Edu Kasyno</strong>
      </div>

      <nav>
        <Link to="/" className="link">Home</Link>
        <Link to="/sloty" className="link">Sloty</Link>
        <Link to="/ruletka" className="link">Ruletka</Link>
        <Link to="/zdrapki" className="link">Zdrapki</Link>
      </nav>

      <div className="wallet">
        <div>{formatBalance(balance)}</div>
        <img src="zeton-portfel.svg" />
      </div>
    </header>
  )
}

export default Navbar