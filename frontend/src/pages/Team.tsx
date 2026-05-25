import { Hero } from "../components/Hero";

export const Team = () => {
  return (
    <main>
      <Hero 
        title="Nasz Zespół" 
        description="Pasjonaci kodowania, matematyki i analizy danych, którzy stworzyli Edu Kasyno." 
        image="https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=1000" 
      />
      <section className="page-content">
        <h2>Kto stoi za projektem?</h2>
        <p>Jesteśmy zespołem programistów i projektantów, którzy chcą odczarować mit "pewnego zysku" w grach losowych. Nasza praca polega na przekładaniu skomplikowanych algorytmów na przystępne wizualizacje w React.</p>
      </section>
    </main>
  );
};