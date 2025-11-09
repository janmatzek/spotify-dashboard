# Stage 1: Build the frontend app
FROM node:24-alpine AS build

WORKDIR /app
COPY frontend/package*.json ./
RUN npm install --omit=dev
COPY frontend/ .
RUN npm run build

# Stage 2: Serve the built app with Nginx
FROM nginx:1.29.1-alpine AS production

COPY --from=build /app/dist /usr/share/nginx/html
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
EXPOSE 443
