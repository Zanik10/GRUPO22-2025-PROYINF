FROM node:20

WORKDIR /app

# 1. Copiar package.json y lockfile del server
COPY package.json pnpm-lock.yaml* ./

# 2. Instalar pnpm y dependencias
RUN npm install -g pnpm
ENV CI=true
RUN pnpm install --no-frozen-lockfile

# 3. Copiar el resto del código del server
COPY . .

# 4. Comando por defecto
CMD ["pnpm", "dev"]
