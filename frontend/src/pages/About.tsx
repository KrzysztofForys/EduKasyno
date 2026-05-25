import { Hero } from "../components/Hero";

export const About = () => {
  return (
    <main>
      <Hero 
        title="O projekcie Edu Kasyno" 
        description="Łączymy zabawę z nauką mechanik gier losowych, aby budować świadomość graczy." 
        image="https://images.unsplash.com/photo-1518133910546-b6c2fb7d79e3?q=80&w=1000" 
      />
      <section className="page-content">
        <h2>Nasza Historia</h2>
        <p>Edu Kasyno powstało jako projekt edukacyjny, który ma na celu pokazanie, jak działają algorytmy w grach. Nie namawiamy do hazardu – uczymy matematyki, która za nim stoi.</p>
      </section>
    </main>
  );
};