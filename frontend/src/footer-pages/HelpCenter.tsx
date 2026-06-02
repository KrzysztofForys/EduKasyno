import React, { useState } from "react";
import styles from "./HelpCenter.module.css";

interface FAQItem {
  question: string;
  answer: string;
  category: "account" | "games" | "tech";
}

export const HelpCenter: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<"all" | "account" | "games" | "tech">("all");
  const [formData, setFormData] = useState({ name: "", email: "", subject: "", message: "" });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const faqData: FAQItem[] = [
    {
      category: "account",
      question: "Czy gra w EduKasynie wymaga wpłaty prawdziwych pieniędzy?",
      answer: "Absolutnie nie! EduKasyno jest w 100% darmową platformą edukacyjną. Wszystkie żetony mają wartość wyłącznie wirtualną i służą do mierzenia Twoich postępów w nauce."
    },
    {
      category: "games",
      question: "Jak działają quizy połączone ze slotami?",
      answer: "Aby zakręcić bębnami maszyny lub obstawić pole, musisz najpierw odpowiedzieć na pytanie z wybranej dziedziny naukowej. Poprawna odpowiedź odblokowuje mnożniki i zwiększa szansę na wirtualną wygraną!"
    },
    {
      category: "tech",
      question: "Co zrobić, jeśli gra się zawiesi, a stracę wirtualne żetony?",
      answer: "Bez paniki. Nasz system automatycznie zapisuje stan Twojej sesji przed każdym losowaniem. Jeśli nastąpi rozłączenie, balans zostanie przywrócony do ostatniego stabilnego stanu."
    },
    {
      category: "account",
      question: "Jak mogę zresetować swoje statystyki i zacząć naukę od nowa?",
      answer: "Możesz to zrobić w dowolnym momencie w ustawieniach swojego profilu, klikając przycisk 'Resetuj postęp'. Spowoduje to wyczyszczenie historii quizów i przywrócenie startowego balansu monet."
    }
  ];

  const filteredFaq = activeCategory === "all"
    ? faqData
    : faqData.filter(item => item.category === activeCategory);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Tutaj normalnie leci strzał do API
    setIsSubmitted(true);
    setFormData({ name: "", email: "", subject: "", message: "" });
  };

  return (
    <div className={styles.container}>

      {/* Nagłówek */}
      <section className={styles.hero}>
        <span className={styles.badge}>Support 24/7</span>
        <h1 className={styles.title}>Centrum <span>Pomocy</span></h1>
        <p className={styles.subtitle}>
          Masz pytanie dotyczące mechaniki gry lub napotkałeś problem techniczny?
          Znajdź szybką odpowiedź lub skontaktuj się bezpośrednio z naszą załogą.
        </p>
      </section>

      {/* Sekcja FAQ z filtrami */}
      <section className={styles.faqSection}>
        <div className={styles.filterBar}>
          <button onClick={() => setActiveCategory("all")} className={activeCategory === "all" ? styles.btnActive : ""}>Wszystkie</button>
          <button onClick={() => setActiveCategory("account")} className={activeCategory === "account" ? styles.btnActive : ""}>🔑 Konto</button>
          <button onClick={() => setActiveCategory("games")} className={activeCategory === "games" ? styles.btnActive : ""}>🎰 Gry i Rozgrywka</button>
          <button onClick={() => setActiveCategory("tech")} className={activeCategory === "tech" ? styles.btnActive : ""}>⚙️ Techniczne</button>
        </div>

        <div className={styles.faqGrid}>
          {filteredFaq.map((faq, index) => (
            <div key={index} className={styles.faqCard}>
              <h4>{faq.question}</h4>
              <p>{faq.answer}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Formularz Kontaktowy (Otwieranie Ticketu) */}
      <section className={styles.contactSection}>
        <div className={styles.contactInfo}>
          <h2>Nie znalazłeś odpowiedzi?</h2>
          <p>Napisz do nas bezpośrednio. Odpowiadamy najczęściej w ciągu kilku godzin!</p>
          <div className={styles.infoMeta}>
            <span>📧 support@edukasyno.pl</span>
            <span>📍 Cyber-Space, Cloud Base</span>
          </div>
        </div>

        <div className={styles.formContainer}>
          {isSubmitted ? (
            <div className={styles.successMessage}>
              <h3>🚀 Ticket wysłany pomyślnie!</h3>
              <p>Dziękujemy za kontakt. Nasz support już analizuje Twoje zgłoszenie.</p>
              <button onClick={() => setIsSubmitted(false)} className={styles.submitBtn}>Wyślij kolejną wiadomość</button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.formRow}>
                <div className={styles.inputGroup}>
                  <label>Twój Nick / Imię</label>
                  <input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="np. PlayerOne" />
                </div>
                <div className={styles.inputGroup}>
                  <label>E-mail</label>
                  <input type="email" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="twoj@email.com" />
                </div>
              </div>
              <div className={styles.inputGroup}>
                <label>Temat zgłoszenia</label>
                <input type="text" required value={formData.subject} onChange={(e) => setFormData({ ...formData, subject: e.target.value })} placeholder="W czym możemy pomóc?" />
              </div>
              <div className={styles.inputGroup}>
                <label>Treść wiadomości</label>
                <textarea rows={5} required value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })} placeholder="Opisz swój problem lub sugestię..."></textarea>
              </div>
              <button type="submit" className={styles.submitBtn}>Wyślij Zgłoszenie</button>
            </form>
          )}
        </div>
      </section>

    </div>
  );
};