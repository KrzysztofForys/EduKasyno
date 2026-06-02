import React, { useState } from "react";
import styles from "./FAQ.module.css";

interface FAQItem {
    id: number;
    question: string;
    answer: React.ReactNode;
    category: "rules" | "tokens" | "safety";
}

export const FAQ: React.FC = () => {
    const [searchQuery, setSearchQuery] = useState("");
    const [openId, setOpenId] = useState<number | null>(null);
    const [activeTab, setActiveTab] = useState<"all" | "rules" | "tokens" | "safety">("all");

    const faqItems: FAQItem[] = [
        {
            id: 1,
            category: "rules",
            question: "Na czym polega powiązanie gry z nauką?",
            answer: "W EduKasynie każdy zakład lub spin wymaga wykazania się wiedzą. Aby odblokować bębny lub podwoić wygraną, system rzuca Ci wyzwanie w postaci pytania quizowego. Dobra odpowiedź to klucz do pomnażania punktów!"
        },
        {
            id: 2,
            category: "tokens",
            question: "Jak mogę zdobyć dodatkowe wirtualne żetony?",
            answer: "Żetony odnawiają się automatycznie każdego dnia (Daily Bonus). Dodatkowo możesz je zdobywać za rozwiązywanie serii zadań bezbłędnie (Streak) oraz za zapraszanie znajomych do wspólnej nauki."
        },
        {
            id: 3,
            category: "safety",
            question: "Czy gra jest bezpieczna dla osób niepełnoletnich?",
            answer: "Tak, w 100%. Platforma symuluje jedynie mechaniki wizualne, nie operując na realnych finansach. Naszym celem jest odczarowanie mechanizmów losowych i pokazanie poprzez czystą matematykę, dlaczego hazard w prawdziwym życiu niesie za sobą ryzyko."
        },
        {
            id: 4,
            category: "rules",
            question: "Jakie kategorie wiedzy są dostępne na platformie?",
            answer: "Oferujemy szeroki wachlarz tematów: od matematyki i logiki, przez programowanie (JS/TS, Python), aż po języki obce, historię i wiedzę ogólną. Możesz wybrać swoją specjalizację w profilu."
        },
        {
            id: 5,
            category: "tokens",
            question: "Czy mogę wymienić wirtualną walutę na nagrody rzeczowe?",
            answer: "Obecnie wirtualny balans służy wyłącznie do rywalizacji w globalnym rankingu (Leaderboard) i odblokowywania nowych motywów wizualnych dla Twojego profilu. Punkty nie mają wartości materialnej."
        },
        {
            id: 6,
            category: "rules",
            question: "Czy mogę pobrac css przygotowany przez Oskara?",
            answer: (
                <>
                    Tak, oczywiście! Wystarczy kliknąć w ten przycisk:{" "}
                    <a
                        href="/Oskar.css"
                        download="oskarito-cyber-theme.css"
                        className={styles.downloadBtn}
                    >
                        Pobierz plik
                    </a>
                </>
            )
        }
    ];

    const toggleItem = (id: number) => {
        setOpenId(openId === id ? null : id);
    };

    // Filtrowanie pytań po kategorii oraz wyszukiwarce tekstowej
    const filteredItems = faqItems.filter((item) => {
        const matchesTab = activeTab === "all" || item.category === activeTab;

        // Zabezpieczenie na wypadek przeszukiwania po polu tekstowym – jeśli answer to obiekt JSX, szukamy tylko w question
        const answerText = typeof item.answer === "string" ? item.answer.toLowerCase() : "";
        const matchesSearch = item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
            answerText.includes(searchQuery.toLowerCase());

        return matchesTab && matchesSearch;
    });

    return (
        <div className={styles.faqPage}>

            {/* Sekcja nagłówkowa */}
            <section className={styles.header}>
                <span className={styles.badge}>Baza Wiedzy</span>
                <h1 className={styles.title}>Często Zadawane <span>Pytania</span></h1>
                <p className={styles.subtitle}>
                    Znajdź błyskawiczne wyjaśnienia dotyczące mechanik gry, wirtualnej waluty i zasad bezpieczeństwa.
                </p>

                {/* Live Search Input */}
                <div className={styles.searchWrapper}>
                    <input
                        type="text"
                        placeholder="Wpisz słowo kluczowe... (np. żetony, bezpieczeństwo)"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className={styles.searchInput}
                    />
                    <span className={styles.searchIcon}>🔍</span>
                </div>
            </section>

            {/* Filtry kategorii */}
            <div className={styles.tabs}>
                <button onClick={() => setActiveTab("all")} className={activeTab === "all" ? styles.tabActive : ""}>Wszystkie</button>
                <button onClick={() => setActiveTab("rules")} className={activeTab === "rules" ? styles.tabActive : ""}>📜 Zasady i Edukacja</button>
                <button onClick={() => setActiveTab("tokens")} className={activeTab === "tokens" ? styles.tabActive : ""}>🪙 Żetony i Wyniki</button>
                <button onClick={() => setActiveTab("safety")} className={activeTab === "safety" ? styles.tabActive : ""}>🛡️ Bezpieczeństwo</button>
            </div>

            {/* Lista FAQ (Accordion) */}
            <div className={styles.accordion}>
                {filteredItems.length > 0 ? (
                    filteredItems.map((item) => {
                        const isOpen = openId === item.id;
                        return (
                            <div key={item.id} className={`${styles.card} ${isOpen ? styles.cardOpen : ""}`}>
                                <button className={styles.trigger} onClick={() => toggleItem(item.id)}>
                                    <span className={styles.questionText}>{item.question}</span>
                                    <span className={`${styles.arrow} ${isOpen ? styles.arrowRotated : ""}`}>▼</span>
                                </button>
                                <div className={`${styles.content} ${isOpen ? styles.contentVisible : ""}`}>
                                    <div className={styles.innerContent}>
                                        {/* Zamiana p na div zapobiega błędom parsowania HTML w konsoli */}
                                        <div className={styles.answerText}>{item.answer}</div>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className={styles.noResults}>
                        <span>❌</span>
                        <p>Nie znaleziono odpowiedzi na to zapytanie. Spróbuj wpisać inne słowo kluczowe.</p>
                    </div>
                )}
            </div>

        </div>
    );
};