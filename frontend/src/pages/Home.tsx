import {Hero} from "../components/Hero"
import GameCard from "../components/GameCard"

export const Home = () => {
  return (
    <>
        <Hero title="Naucz się grać mądrze i odpowiedzialnie!" description="Edu Kasyno to Twoja brama do świata gier, gdzie bezpieczeństwo i edukacja są priorytetem." image="https://picsum.photos/560/400"/>

      <section className="games">
        <h2>Odkryj nasze gry edukacyjne</h2>

        <div className="cards">
          <GameCard title="Sloty" desc="Ekscytujące bębny pełne szans na wygraną." link="/sloty" />
          <GameCard title="Ruletka" desc="Zakręć kołem fortuny." link="/ruletka" />
          <GameCard title="Zdrapki" desc="Szybka zabawa i natychmiastowe nagrody." link="/zdrapki" />
        </div>
      </section>
    </>
  )
}

export default Home