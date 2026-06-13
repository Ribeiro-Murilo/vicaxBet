# Frontend: builda o Vite e serve o estatico com nginx. Build a partir da raiz (context: .)
FROM node:20-alpine AS build
WORKDIR /app/web
COPY web/package.json ./
RUN npm install
COPY web ./
# Endereco do back e congelado no build do Vite (vem do .env via docker-compose)
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

FROM nginx:alpine
COPY web/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/web/dist /usr/share/nginx/html
EXPOSE 80
