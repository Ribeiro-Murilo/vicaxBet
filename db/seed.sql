USE vicaxbet;

-- Admin "O Cartola". Login: admin / Senha: admin
INSERT INTO users (username, password_hash, is_admin, pontos_principais, fichas)
VALUES ('admin', '$2a$08$11IHqvAJqFtHs4BIEu2r7uKrsb8BIkdpty5J84VIBZHBfkuLucJtC', 1, 0, 1000);

-- Jogos de exemplo da Copa (o Cartola pode cadastrar mais pela tela de admin)
INSERT INTO games (time_a, time_b, data_jogo, created_by) VALUES
  ('Brasil', 'Argentina',  '2026-06-14 16:00:00', 1),
  ('Franca', 'Inglaterra', '2026-06-15 13:00:00', 1),
  ('Alemanha', 'Espanha',  '2026-06-16 16:00:00', 1),
  ('Portugal', 'Holanda',  '2026-06-17 13:00:00', 1);
