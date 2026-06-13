# ViBet — Design

Data: 2026-06-13

## Resumo

Brincadeira de empresa: uma "casa de apostas" da Copa **sem dinheiro real**, só
palpites de placar. Tema satírico de cassino brega. Slogan:
*"A única bet onde você só perde tempo, não dinheiro"*.

Monorepo simples (sem arquitetura complicada): backend Node/Express + frontend
React/Vite + MySQL. Sem criptografia pesada, sem recuperação de senha, sem email.

## Papéis

- **Jogador:** cadastra-se, loga, dá palpites de placar, faz apostas com fichas,
  converte moeda e vê os rankings.
- **Admin ("O Cartola"):** cadastra os jogos da Copa e lança o placar real.
  Ao lançar o placar, o sistema resolve palpites e apostas daquele jogo.

## Economia: duas moedas, dois rankings

### Pontos Principais (PP) — ranking de habilidade
- Cada jogador tem **1 palpite oficial de placar por jogo** (registrado antes do jogo).
- Resolução ao lançar o placar real:
  - Placar exato → **+100 PP**
  - Só o vencedor / empate certo → **+10 PP**
  - Errou → 0
- Ranking ordenado por PP (desc).

### Fichas (FA) — ranking de apostador
- Saldo inicial: **1000 FA**.
- **Bônus passivo** (do mesmo palpite oficial, sem arriscar nada):
  - Placar exato → **+1000 FA**
  - Vencedor certo → **+500 FA**
- **Aposta ativa** (casa de aposta satírica):
  - Jogador escolhe um jogo, palpita o **placar exato** e define o valor de fichas a apostar.
  - Sistema gera uma **odd aleatória entre 1.1x e 20x**, travada no momento da aposta.
  - Resolução: acertou o placar exato → **+ (valor × odd)** · errou → **− valor**.
- **Câmbio (proposital ruim, parte da piada):**
  - `1 PP → 500 FA`
  - `250 FA → 1 PP`
- Ranking ordenado por FA (desc), separado do ranking de PP.

## Fluxo de resolução de um jogo

1. Admin lança o placar real do jogo.
2. Para cada palpite oficial do jogo: aplica PP (100/10/0) e bônus passivo de FA (1000/500/0).
3. Para cada aposta ativa do jogo: se o placar exato bate, credita `valor × odd`;
   senão, a aposta já debitou as fichas no momento da aposta (ou debita aqui — ver Decisões).
4. Marca o jogo como resolvido (não aceita mais palpites/apostas).

## Arquitetura (monorepo)

```
ViBet/
  package.json          (workspaces + scripts: dev, build)
  db/
    schema.sql          (tabelas)
    seed.sql            (admin inicial + jogos de exemplo da Copa)
  server/               (Express + mysql2)
    index.js
    db.js
    rotas: auth, games, palpites, apostas, ranking, admin
  web/                  (React + Vite)
    páginas: Login/Cadastro, Jogos, Minhas Apostas, Rankings, Admin
```

### Auth
- Username + senha. Hash leve com bcrypt.
- Token JWT simples guardado no localStorage.
- Sem recuperação de senha, sem 2FA, sem email.

### Banco (MySQL) — tabelas

- `users` — id, username, password_hash, is_admin, pontos_principais, fichas, created_at
- `games` — id, time_a, time_b, data_jogo, gol_a (nullable), gol_b (nullable),
  status (aberto/resolvido), created_by
- `palpites` — id, user_id, game_id, palpite_gol_a, palpite_gol_b, created_at
  (único por user_id+game_id; é o palpite oficial usado para PP e bônus de FA)
- `apostas` — id, user_id, game_id, palpite_gol_a, palpite_gol_b, valor, odd,
  status (pendente/ganhou/perdeu), created_at
- `ledger` (opcional) — histórico de movimentações de moeda

## Fora de escopo (YAGNI)

Sem dinheiro real, sem pagamento, sem 2FA, sem recuperação de senha, sem app mobile,
sem odds "reais" (são aleatórias de propósito), sem internacionalização.

## Decisões em aberto (a confirmar no plano)

- Quando debitar as fichas da aposta ativa: no ato de apostar (recomendado, evita saldo
  negativo) ou só na resolução.
- Travar palpite/aposta após a data do jogo ou só quando o admin resolve.
- Seed da Copa: lista fixa de jogos de exemplo (não precisa ser a tabela real).
