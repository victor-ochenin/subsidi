USE subsidi_db;

CREATE TABLE IF NOT EXISTS city_coefficients (
    id INT NOT NULL AUTO_INCREMENT,
    city_name VARCHAR(100) NOT NULL,
    market_value_per_sq_meter DECIMAL(10, 2) NOT NULL,
    market_value_correction_factor DECIMAL(10, 2) NOT NULL DEFAULT 1.0,
    PRIMARY KEY(id),
    UNIQUE(city_name)
);

DELETE FROM city_coefficients;

ALTER TABLE city_coefficients AUTO_INCREMENT = 1;

INSERT INTO city_coefficients (
    city_name,
    market_value_per_sq_meter,
    market_value_correction_factor
) VALUES 
    (N'Москва', 98300.00, 1.00),
    (N'Санкт-Петербург', 91400.00, 1.00);
