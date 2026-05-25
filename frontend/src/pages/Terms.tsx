import { Hero } from "../components/Hero";

export const Terms = () => {
  return (
    <main>
      <Hero 
        title="Regulamin Projektu" 
        description="Zasady korzystania z platformy edukacyjnej Edu Kasyno." 
        image="https://images.unsplash.com/photo-1450133064473-71024230f91b?q=80&w=1000" 
      />
      <section className="page-content">
        <h2>Warunki korzystania</h2>
        <div className="terms-container">
          <h3>§1 Postanowienia ogólne</h3>
          <p>Edu Kasyno jest symulatorem i projektem wyłącznie edukacyjnym. Żadne prawdziwe środki finansowe nie są tutaj przyjmowane ani wypłacane.</p>
          
          <h3>§2 Odpowiedzialność</h3>
          <p>Wszystkie gry (sloty, ruletka, zdrapki) działają w oparciu o generatory liczb losowych (RNG) w celach demonstracyjnych.</p>
        </div>
      </section>
    </main>
  );
};