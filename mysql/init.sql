USE subsidi_db;

CREATE TABLE IF NOT EXISTS city_coefficients (
    id INT NOT NULL AUTO_INCREMENT,
    city_name VARCHAR(100) NOT NULL,
    coefficient DECIMAL(10, 2) NOT NULL,
    PRIMARY KEY(id),
    UNIQUE(city_name)
);

DELETE FROM city_coefficients;

ALTER TABLE city_coefficients AUTO_INCREMENT = 1;

INSERT INTO city_coefficients (
    city_name,
    coefficient
) VALUES 
    (N'Москва', 1.50),
    (N'Санкт-Петербург', 1.30)
