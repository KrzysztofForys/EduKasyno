import { Link } from "react-router-dom"
type NavbarProps = {
  balance: number
}
export const Navbar = ({balance}: NavbarProps) => {
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
        <div>{balance}</div>
        <img src="zeton-maly.svg"/>
      </div>
    </header>
  )
}

export default Navbar