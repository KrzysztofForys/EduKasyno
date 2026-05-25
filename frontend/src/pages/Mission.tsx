import { Hero } from "../components/Hero";

export const Mission = () => {
  return (
    <main>
      <Hero 
        title="Nasza Misja" 
        description="Przejrzystość, edukacja i odpowiedzialność w świecie cyfrowej rozrywki." 
        image="https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=1000" 
      />
      <section className="page-content">
        <div className="mission-grid">
          <div className="mission-item">
            <h3>Edukacja</h3>
            <p>Pokazujemy prawdopodobieństwo wygranej w sposób czysty i zrozumiały.</p>
          </div>
          <div className="mission-item">
            <h3>Bezpieczeństwo</h3>
            <p>Tworzymy bezpieczne środowisko do testowania strategii bez ryzyka finansowego.</p>
          </div>
        </div>
      </section>
    </main>
  );
};