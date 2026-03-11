import { useState } from 'react'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <header className="nav">
        <div className="logo">
            <span>🎓</span>
            <strong>Edu Kasyno</strong>
        </div>
        <p className="nav-text">Bezpieczne kasyno – wiedza to podstawa</p>
    </header>

    <section className="hero">
        <div className="hero-text">
            <h1>Naucz się grać mądrze i odpowiedzialnie!</h1>
            <p>
                Edu Kasyno to Twoja brama do świata gier, gdzie bezpieczeństwo i edukacja są priorytetem. Poznaj zasady,
                strategie i baw się dobrze, rozwijając swoje umiejętności.
            </p>
        </div>
        <img src="https://picsum.photos/560/400" alt="Grafika edukacyjna"/>
    </section>

    <section className="games">
        <h2>Odkryj nasze gry edukacyjne</h2>

        <div className="cards">
            <div className="card">
                <img src="https://picsum.photos/374/320" alt="Gra"/>
                <div className="card-content">
                    <h3>Sloty</h3>
                    <p>Ekscytujące bębny pełne szans na wygraną. Zasady są proste!</p>
                </div>
            </div>

            <div className="card">
                <img src="https://picsum.photos/374/320" alt="Gra"/>
                <div className="card-content">
                    <h3>Ruletka</h3>
                    <p>Zakręć kołem fortuny i poczuj dreszczyk emocji w klasycznej grze.</p>
                </div>
            </div>

            <div className="card">
                <img src="https://picsum.photos/374/320" alt="Gra"/>
                <div className="card-content">
                    <h3>Zdrapki</h3>
                    <p>Szybka zabawa i natychmiastowe nagrody. Odkryj swój szczęśliwy symbol!.</p>
                </div>
            </div>
        </div>
    </section>

    <section className="cta">
        <h2>Gotowy, by zacząć swoją edukacyjną podróż?</h2>
        <button>Rozpocznij naukę teraz!</button>
    </section>

    <footer className="footer">
        <div>
            <h4>O nas</h4>
            <p>Nasza misja</p>
            <p>Zespół</p>
            <p>Kontakt</p>
        </div>
        <div>
            <h4>Zasady gry</h4>
            <p>Odpowiedzialna gra</p>
            <p>Regulamin</p>
        </div>
        <div>
            <h4>Wsparcie</h4>
            <p>Pomoc</p>
            <p>Kontakt</p>
        </div>
    </footer>
  </>
  )
}

export default App
