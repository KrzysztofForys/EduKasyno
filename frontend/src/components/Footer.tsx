import { Link } from "react-router-dom"

export const Footer = () => {
  return (
    <footer className="footer">
      <div>
        <h4>O nas</h4>
        <p><Link to="/o-nas" className="footer-link">O nas</Link></p>
        <p><Link to="/misja" className="footer-link">Nasza misja</Link></p>
        <p><Link to="/zespol" className="footer-link">Zespół</Link></p>
        <p><Link to="/kontakt" className="footer-link">Kontakt</Link></p>
      </div>

      <div>
        <h4>Zasady gry</h4>
        <p><Link to="/odpowiedzialna-gra" className="footer-link">Odpowiedzialna gra</Link></p>
        <p><Link to="/regulamin" className="footer-link">Regulamin</Link></p>
      </div>

      <div>
        <h4>Wsparcie</h4>
        <p><Link to="/pomoc" className="footer-link">Pomoc</Link></p>
        <p><Link to="/kontakt" className="footer-link">Kontakt</Link></p>
      </div>
    </footer>
  )
}