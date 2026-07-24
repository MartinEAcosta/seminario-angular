# syntax=docker/dockerfile:1
ARG NODE_VERSION=20.18.1

################################################################################
# Etapa 1: build
FROM node:${NODE_VERSION}-alpine AS build
WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

################################################################################
# Etapa 2: runtime — servir estáticos con nginx
FROM nginx:alpine AS final

COPY --from=build /usr/src/app/dist/seminario-angular/browser /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]