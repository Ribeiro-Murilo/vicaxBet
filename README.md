# vicaxBet

A casa de apostas da firma. So a Copa, **sem dinheiro de verdade** - voce so perde
tempo e dignidade. Brincadeira interna, vai pela satira.

## O que e

- Login e cadastro (sem firula de criptografia pesada).
- **Moeda unica: pontos.** Cada jogador comeca com **1000 pontos**.
- **Aposta de pontos com odds:** voce escolhe um jogo, palpita o **placar exato**,
  define quantos pontos apostar, e o sistema sorteia uma **odd de 1.1x a 20x** travada na hora.
  - Acertou o placar exato -> ganha `pontos x odd`.
  - Acertar **so o vencedor nao da nada**.
  - Errou -> perde os pontos apostados.
- **Um ranking** por pontos.
- Admin ("O Cartola") cadastra os jogos e lanca o placar final, que resolve as apostas.

## Stack

Monorepo simples com npm workspaces:

- `server/` - Express + mysql2 (API REST, JWT)
- `web/` - React + Vite
- `db/` - schema e seed MySQL

## Como rodar

### 1. Banco (MySQL)

Precisa de um servidor MySQL rodando. Crie o banco e popule:

```bash
mysql -u root < db/schema.sql
mysql -u root < db/seed.sql
```

> O `schema.sql` ja cria o database `vicaxbet`. O `seed.sql` cria o admin
> (**login: admin / senha: admin**) e alguns jogos de exemplo.

### 2. Configuracao

```bash
cp .env.example .env
# ajuste DB_USER, DB_PASSWORD etc. se precisar
```

O `.env` fica na raiz e o server le de la.

### 3. Dependencias

```bash
npm install
```

### 4. Subir tudo

```bash
npm run dev
```

Isso sobe o server (porta 3001) e o web (porta 5173) juntos.
Acesse **http://localhost:5173**.

Ou separadamente:

```bash
npm run dev:server
npm run dev:web
```

## Testes

A logica de pontuacao (o coracao da brincadeira) tem testes:

```bash
npm -w server test
```

## Gerar hash de senha pro seed

Se quiser trocar a senha do admin no seed:

```bash
node server/scripts/gerar-hash-admin.js minhasenha
```

Copie o hash gerado para o `db/seed.sql`.

---

Jogue com responsabilidade. Ou nao, e tudo de mentira mesmo.
