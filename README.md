# Grupo 22

Este es el repositorio del Grupo 22, cuyos integrantes son:

* Juan Carlos Vargas - 202373569-8
* Cristobal Reyes Silva - 202373562-0
* Hector Jerez Fantini - 202373544-2
* **Tutor**: Ricardo Salas

## Wiki

> [Wiki](https://github.com/Zanik10/GRUPO22-2025-PROYINF/wiki)

## Videos

* [Video presentación cliente](https://aula.usm.cl/mod/resource/view.php?id=6926137)
  
## Aspectos técnicos relevantes

Requisitos:
- Node.js LTS (20+ o 22+) y pnpm  
- Activar pnpm: `corepack enable && corepack prepare pnpm@latest --activate`
- Docker Desktop (con PostgreSQL via docker-compose)
- Git

Arranque rápido (desarrollo):
- Clonar el repo y entrar a la carpeta
- Copiar variables: `cp .env.example .env`
- Instalar dependencias: `pnpm install`
- Levantar la base de datos: `pnpm db:up`
- Iniciar todo (API + Web + Desktop): `pnpm dev`
