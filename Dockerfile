# Frontend de NanitoMangas: compila con Vite y lo sirve con nginx (que además reenvía /api, /auth y /mdx).
FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:1.27-alpine
COPY --from=build /app/dist /usr/share/nginx/html
# nginx sustituye ${BACKEND_URL} al arrancar (plantillas del contenedor oficial).
COPY deploy/nginx.conf.template /etc/nginx/templates/default.conf.template
EXPOSE 80
