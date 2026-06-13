USE vibet;

-- Admin "O Cartola". Login: admin / Senha: senhaadmin
INSERT INTO users (username, password_hash, is_admin, pontos_principais, pontos_aposta)
VALUES ('admin', '$2a$08$FPsMQ6gIP9bGjBizw2daD.y0gDSfdJ3iy7z9A3Q2TDMWuEld56/HW', 1, 0, 1000);

-- Jogos de exemplo da Copa. data_jogo e o prazo: depois dela trava palpite e aposta.
