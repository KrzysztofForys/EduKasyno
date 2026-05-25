import { Hero } from "../components/Hero";

export const Contact = () => {
  return (
    <main>
      <Hero 
        title="Skontaktuj się z nami" 
        description="Masz pytania dotyczące projektu? Napisz do zespołu Edu Kasyno." 
        image="https://images.unsplash.com/photo-1523966211575-eb4a01e7dd51?q=80&w=1000" 
      />
      <section className="page-content">
        <div className="contact-info">
          <p><strong>Email:</strong> kontakt@edukasyno.pl</p>
          <p><strong>GitHub:</strong> github.com/edukasyno</p>
          <p><strong>Lokalizacja:</strong> Projekt w chmurze ☁️</p>
        </div>
      </section>
    </main>
  );
};