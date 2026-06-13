# Backend Node. Build a partir da raiz do repo (context: .)
FROM node:20-alpine

WORKDIR /app/server

# Instala so as deps do server (todas JS puro, sem build nativo)
COPY server/package.json ./
RUN npm install --omit=dev

COPY server ./

EXPOSE 3001
CMD ["node", "src/index.js"]
