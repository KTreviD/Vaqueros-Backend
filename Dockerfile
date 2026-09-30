# ==============================
# ETAPA 1: BUILD
# ==============================
FROM node:22-bookworm-slim AS builder

WORKDIR /app

# Primero dependencias para aprovechar cache de Docker
COPY package.json package-lock.json ./

RUN npm ci

# Copiamos el proyecto
COPY . .

# Garantiza que exista por express.static("public")
RUN mkdir -p public

# Compilar TypeScript -> dist/
RUN npm run build


# ==============================
# ETAPA 2: PRODUCCIÓN
# ==============================
FROM node:22-bookworm-slim AS production

WORKDIR /app

ENV NODE_ENV=production

COPY package.json package-lock.json ./

# Solo dependencias necesarias para ejecutar
RUN npm ci --omit=dev

# Código compilado
COPY --from=builder /app/dist ./dist

# Tu backend usa express.static("public")
COPY --from=builder /app/public ./public

EXPOSE 8000

CMD ["npm", "start"]