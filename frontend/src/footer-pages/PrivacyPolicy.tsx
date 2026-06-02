import React, { useState } from "react";
import styles from "./PrivacyPolicy.module.css";

interface PolicySection {
    id: string;
    tabLabel: string;
    title: string;
    content: React.ReactNode;
}

export const PrivacyPolicy: React.FC = () => {
    const [activeTab, setActiveTab] = useState<string>("data-collect");

    const sections: PolicySection[] = [
        {
            id: "data-collect",
            tabLabel: "1. Jakie dane zbieramy",
            title: "Przetwarzanie Danych Graczów",
            content: (
                <>
                    <p>W EduKasynie zbieramy tylko te informacje, które są niezbędne do prawidłowego działania Twojego wirtualnego konta i śledzenia postępów w nauce:</p>
                    <ul>
                        <li><strong>Dane rejestracyjne:</strong> Adres e-mail, nazwa użytkownika (nickname) oraz zahaszowane hasło.</li>
                        <li><strong>Statystyki gry:</strong> Historia Twoich odpowiedzi w quizach, stan wirtualnego balansu żetonów oraz zdobyte osiągnięcia (achievements).</li>
                        <li><strong>Dane techniczne:</strong> Adres IP (wyłącznie w celu ochrony przed botami i atakami DDoS) oraz typ przeglądarki.</li>
                    </ul>
                </>
            )
        },
        {
            id: "data-use",
            tabLabel: "2. Cel przetwarzania",
            title: "Po co nam Twoje dane?",
            content: (
                <>
                    <p>Twoje dane nie są i nigdy nie będą przedmiotem handlu. Wykorzystujemy je wyłącznie do celów mechanicznych platformy:</p>
                    <ul>
                        <li>Utrzymanie sesji gracza i zapisywanie stanu konta po wylogowaniu.</li>
                        <li>Dostosowywanie poziomu trudności pytań algorytmu edukacyjnego do Twoich wyników.</li>
                        <li>Generowanie globalnego rankingu najlepszych graczy (Leaderboard), gdzie widoczny jest wyłącznie Twój publiczny nickname.</li>
                    </ul>
                </>
            )
        },
        {
            id: "cookies",
            tabLabel: "3. Pliki Cookies",
            title: "Ciasteczka i Technologie Śledzące",
            content: (
                <>
                    <p>Używamy plików cookies (ciasteczek) wyłącznie w celach funkcjonalnych. Nie śledzimy Cię w celach marketingowych na zewnętrznych portalach.</p>
                    <p>Nasze cookies zapamiętują, że jesteś zalogowany, oraz przechowują Twoje preferencje wizualne (np. tryb ciemny/jasny i głośność efektów dźwiękowych w grach).</p>
                </>
            )
        },
        {
            id: "security",
            tabLabel: "4. Bezpieczeństwo",
            title: "Ochrona Twojego Konta",
            content: (
                <>
                    <p>Bezpieczeństwo bazy danych to dla nas priorytet. Stosujemy nowoczesne protokoły szyfrowania SSL/TLS dla każdego połączenia.</p>
                    <p>Hasła użytkowników są zabezpieczone zaawansowanym algorytmem mapowania kryptograficznego. Nawet administratorzy platformy nie mają wglądu w Twoje rzeczywiste hasło.</p>
                </>
            )
        },
        {
            id: "user-rights",
            tabLabel: "5. Twoje Prawa",
            title: "Pełna Kontrola nad Profilu",
            content: (
                <>
                    <p>Zgodnie z przepisami o ochronie danych (RODO), masz pełne prawo do zarządzania swoimi informacjami:</p>
                    <ul>
                        <li>Prawo do wglądu w swoje dane oraz ich poprawiania w panelu profilu.</li>
                        <li>Prawo do przenoszenia historii swoich osiągnięć edukacyjnych.</li>
                        <li><strong>Prawo do bycia zapomnianym:</strong> W każdej chwili możesz bezpowrotnie usunąć swoje konto z bazy danych, co natychmiast czyści wszelkie powiązane z Tobą rekordy.</li>
                    </ul>
                </>
            )
        }
    ];

    const currentSection = sections.find(s => s.id === activeTab) || sections[0];

    return (
        <div className={styles.privacyPage}>

            {/* Nagłówek strony */}
            <section className={styles.headerSection}>
                <span className={styles.badge}>Ochrona Prywatności</span>
                <h1 className={styles.title}>
                    Polityka <span>Prywatności</span>
                </h1>
                <p className={styles.subtitle}>
                    Szanujemy Twój czas i prywatność. Poniżej znajdziesz konkretne, pozbawione prawniczego bełkotu
                    informacje o tym, jak dbamy o bezpieczeństwo Twoich danych.
                </p>
            </section>

            {/* Główny układ: Menu po lewej, Treść po prawej */}
            <div className={styles.layoutWrapper}>

                {/* Lewy Sidebar - Zakładki */}
                <nav className={styles.sidebar}>
                    {sections.map((section) => (
                        <button
                            key={section.id}
                            className={`${styles.tabButton} ${activeTab === section.id ? styles.tabActive : ""}`}
                            onClick={() => setActiveTab(section.id)}
                        >
                            {section.tabLabel}
                        </button>
                    ))}
                </nav>

                {/* Prawy Kontener - Dynamiczna treść */}
                <main className={styles.contentDisplay}>
                    <h2 className={styles.contentTitle}>{currentSection.title}</h2>
                    <div className={styles.contentText}>
                        {currentSection.content}
                    </div>
                </main>

            </div>

        </div>
    );
};