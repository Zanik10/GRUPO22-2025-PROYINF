FROM node:20

WORKDIR /app


COPY package.json pnpm-lock.yaml* ./


RUN npm install -g pnpm
ENV CI=true
RUN pnpm install --no-frozen-lockfile


COPY . .


CMD ["pnpm", "dev"]
