import { Link } from "react-router-dom"
type NavbarProps = {
  balance: number
}
export const Navbar = ({balance}: NavbarProps) => {
  return (
    <header className="nav">
      <div className="logo">
        <span>🎓</span>
        <strong>Edu Kasyno</strong>
      </div>

      <nav>
        {balance} <img src="zeton-maly.png"/>
        <Link to="/" className="link">Home</Link>
        <Link to="/sloty" className="link">Sloty</Link>
        <Link to="/ruletka" className="link">Ruletka</Link>
        <Link to="/zdrapki" className="link">Zdrapki</Link>
      </nav>
    </header>
  )
}

export default Navbar