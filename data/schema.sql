DROP TABLE IF EXISTS digi_test;
CREATE TABLE digi_test(
    id SERIAL PRIMARY KEY,
    name VARCHAR(255),
    image VARCHAR(255),
    level VARCHAR(255)
);