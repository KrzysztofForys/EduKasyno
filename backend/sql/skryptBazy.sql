DROP TABLE IF EXISTS historia_gier CASCADE;
DROP TABLE IF EXISTS gracze CASCADE;

CREATE TABLE gracze (
    id SERIAL PRIMARY KEY,
    login VARCHAR(100) NOT NULL UNIQUE,
    haslo VARCHAR(255) NOT NULL,
    saldo NUMERIC(12,2) NOT NULL DEFAULT 1000
);

-- Tworzenie tabeli historia_gier
CREATE TABLE historia_gier (
    id SERIAL PRIMARY KEY,
    id_gracza INT NOT NULL,
    nazwa_gry VARCHAR(7) NOT NULL,
    wynik INT NOT NULL,
    data_gry TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_gracz
        FOREIGN KEY (id_gracza)
        REFERENCES gracze(id)
        ON DELETE CASCADE
);
