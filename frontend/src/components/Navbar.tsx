import { Link } from "react-router-dom"

export const Navbar = () => {
  return (
    <header className="nav">
      <div className="logo">
        <span>🎓</span>
        <strong>Edu Kasyno</strong>
      </div>

      <nav>
        <Link to="/" className="link">Home</Link>
        <Link to="/sloty" className="link">Sloty</Link>
        <Link to="/ruletka" className="link">Ruletka</Link>
        <Link to="/zdrapki" className="link">Zdrapki</Link>
      </nav>
    </header>
  )
}

export default Navbar