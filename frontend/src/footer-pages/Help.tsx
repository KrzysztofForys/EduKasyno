import { Hero } from "../components/Hero";

export const Help = () => {
  return (
    <main>
      <Hero 
        title="Centrum Pomocy" 
        description="Masz problem z działaniem symulatora? Znajdź rozwiązanie tutaj." 
        image="https://images.unsplash.com/photo-1484067109299-5759b38026ef?q=80&w=1000" 
      />
      <section className="page-content">
        <h2>Najczęściej zadawane pytania (FAQ)</h2>
        <div className="faq-section">
          <div className="faq-item">
            <h4>Czy gra jest darmowa?</h4>
            <p>Tak, platforma jest w 100% darmowa i służy celom edukacyjnym.</p>
          </div>
          <div className="faq-item">
            <h4>Gra mi się zaccięła, co robić?</h4>
            <p>Odśwież stronę (F5). Projekt korzysta z pamięci podręcznej przeglądarki.</p>
          </div>
        </div>
      </section>
    </main>
  );
};