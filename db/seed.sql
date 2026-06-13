USE vicaxbet;

-- Admin "O Cartola". Login: admin / Senha: admin
INSERT INTO users (username, password_hash, is_admin, pontos_principais, pontos_aposta)
VALUES ('admin', '$2a$08$11IHqvAJqFtHs4BIEu2r7uKrsb8BIkdpty5J84VIBZHBfkuLucJtC', 1, 0, 1000);

-- Jogos de exemplo da Copa. data_jogo e o prazo: depois dela trava palpite e aposta.
INSERT INTO games (time_a, time_b, data_jogo, created_by) VALUES
  ('Brasil', 'Argentina',  '2026-06-20 16:00:00', 1),
  ('Franca', 'Inglaterra', '2026-06-21 13:00:00', 1),
  ('Alemanha', 'Espanha',  '2026-06-22 16:00:00', 1),
  ('Portugal', 'Holanda',  '2026-06-23 13:00:00', 1);
