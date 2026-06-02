import { Hero } from "../components/Hero"
import GameCard from "../components/GameCard"
import RuletkaImg from "/Ruletka.png"
import SlotyImg from "/Sloty.png"
import ZdrapkiImg from "/Zdrapki.png"
import EduKasynoImg from "/EduKasyno.png"

export const Home = () => {
  return (
    <>
      <Hero title="Naucz się grać mądrze i odpowiedzialnie!" description="Edu Kasyno to Twoja brama do świata gier, gdzie bezpieczeństwo i edukacja są priorytetem." image={EduKasynoImg} />

      <section className="games">
        <h2>Odkryj nasze gry edukacyjne</h2>

        <div className="cards">
          <GameCard title="Sloty" desc="Ekscytujące bębny pełne szans na wygraną." link="/sloty" image={SlotyImg} />
          <GameCard title="Ruletka" desc="Zakręć kołem fortuny." link="/ruletka" image={RuletkaImg} />
          <GameCard title="Zdrapki" desc="Szybka zabawa i natychmiastowe nagrody." link="/zdrapki" image={ZdrapkiImg} />
        </div>
      </section>
    </>
  )
}

export default Home