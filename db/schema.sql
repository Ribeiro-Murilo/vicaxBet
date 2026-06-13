CREATE DATABASE IF NOT EXISTS vicaxbet
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE vicaxbet;

DROP TABLE IF EXISTS apostas;
DROP TABLE IF EXISTS palpites;
DROP TABLE IF EXISTS games;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  is_admin TINYINT(1) NOT NULL DEFAULT 0,
  pontos INT NOT NULL DEFAULT 1000,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE games (
  id INT AUTO_INCREMENT PRIMARY KEY,
  time_a VARCHAR(60) NOT NULL,
  time_b VARCHAR(60) NOT NULL,
  data_jogo DATETIME NULL,
  gol_a INT NULL,
  gol_b INT NULL,
  status ENUM('aberto','resolvido') NOT NULL DEFAULT 'aberto',
  created_by INT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE apostas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  game_id INT NOT NULL,
  palpite_gol_a INT NOT NULL,
  palpite_gol_b INT NOT NULL,
  valor INT NOT NULL,
  odd DECIMAL(5,2) NOT NULL,
  status ENUM('pendente','ganhou','perdeu') NOT NULL DEFAULT 'pendente',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (game_id) REFERENCES games(id)
);
