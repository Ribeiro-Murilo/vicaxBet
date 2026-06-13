# vicaxBet

A casa de apostas da firma. So a Copa, **sem dinheiro de verdade** - voce so perde
tempo e dignidade. Brincadeira interna, vai pela satira.

## O que e

- Login e cadastro (sem firula de criptografia pesada).
- **Duas pontuacoes independentes, sem troca entre elas:**

### Ponto Principal (serio - vale na Copa)
- Voce so registra **o placar** de cada jogo (um palpite por jogo).
- Quando o admin lanca o placar real, ganha **100 pontos so se acertar o placar EXATO**.
  Acertar so o vencedor nao da nada. Nao existe aposta nem outra forma de ganhar.
- E o que conta no **ranking final da Copa**.

### Ponto de Aposta (satira)
- Cada jogador comeca com **1000 pontos de aposta**.
- Voce aposta em cima do seu palpite e **a casa sorteia uma odd entre 0.2x e 20x**,
  com 50% de chance de cair **abaixo de 1** (da pra ganhar e ainda perder ponto - e a piada).
- So ganha se o placar for exato: recebe `valor x odd`. Senao, perde o que apostou.
- Ranking separado, **nunca** vira ponto principal.

### Prazo
- Cada jogo tem uma data/hora (definida pelo admin). **Depois dela nao da pra mudar
  palpite nem aposta.**

Admin ("O Cartola") cadastra os jogos (com data/hora) e lanca o placar final,
que credita os pontos principais e resolve as apostas.

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
> (**login: admin / senha: senhaadmin**) e alguns jogos de exemplo.

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

## Rodar com Docker

O compose sobe **server + web** (o MySQL fica externo, no host que voce apontar no `.env`).

1. Garanta um MySQL acessivel e carregue schema + seed nele:

```bash
mysql -h SEU_HOST -u SEU_USER -p < db/schema.sql
mysql -h SEU_HOST -u SEU_USER -p < db/seed.sql
```

2. Aponte o `.env` da raiz para esse MySQL (DB_HOST, DB_USER, DB_PASSWORD, DB_NAME).
   O `.env` e lido pelo compose (env_file).

3. Suba:

```bash
docker compose up --build -d
```

- Web: **http://localhost:8080**
- API: **http://localhost:3001**

Para derrubar: `docker compose down`.

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
