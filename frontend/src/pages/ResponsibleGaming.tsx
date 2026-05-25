import { Hero } from "../components/Hero";

export const ResponsibleGaming = () => {
  return (
    <main>
      <Hero 
        title="Odpowiedzialna Gra" 
        description="Graj z głową. Edukacja to klucz do zrozumienia ryzyka." 
        image="https://images.unsplash.com/photo-1596838132731-3301c3fd4317?q=80&w=1000" 
      />
      <section className="page-content">
        <h2>Zasady bezpiecznej zabawy</h2>
        <p>W Edu Kasyno nie ryzykujesz prawdziwych pieniędzy, ale uczymy nawyków, które są kluczowe w prawdziwym życiu:</p>
        <div className="rules-list">
          <div className="rule-box">
            <h4>Traktuj grę jako zabawę</h4>
            <p>Nigdy nie traktuj gier losowych jako sposobu na zarabianie pieniędzy.</p>
          </div>
          <div className="rule-box">
            <h4>Zrozum matematykę</h4>
            <p>Kasyno zawsze ma przewagę statystyczną. Nasze symulatory to udowadniają.</p>
          </div>
        </div>
      </section>
    </main>
  );
};