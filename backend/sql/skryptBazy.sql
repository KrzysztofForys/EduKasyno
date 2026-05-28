CREATE TABLE IF NOT EXISTS gracze (
    id SERIAL PRIMARY KEY,
    login VARCHAR(100) NOT NULL UNIQUE,
    haslo VARCHAR(255) NOT NULL,
    saldo NUMERIC(12,2) NOT NULL DEFAULT 1000
);

-- Tworzenie typu ENUM dla nazw gier
CREATE TYPE IF NOT EXISTS nazwa_gry_enum AS ENUM (
    'Zdrapki',
    'Ruletka',
    'Sloty'
);

-- Tworzenie tabeli historia_gier
CREATE TABLE IF NOT EXISTS historia_gier (
    id SERIAL PRIMARY KEY,
    id_gracza INT NOT NULL,
    nazwa_gry nazwa_gry_enum NOT NULL,
    wynik INT NOT NULL,

    CONSTRAINT fk_gracz
        FOREIGN KEY (id_gracza)
        REFERENCES gracze(id)
        ON DELETE CASCADE
);
