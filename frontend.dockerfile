# Stage 1: Build the frontend app
FROM node:24-alpine AS build

WORKDIR /app
COPY frontend/package*.json ./
RUN npm install --omit=dev
COPY frontend/ .
RUN npm run build

# Stage 2: Serve the built app with Nginx
FROM nginx:1.29.1-alpine AS production

# Create nginx user home directory and set permissions
RUN mkdir -p /var/cache/nginx/client_temp && \
    mkdir -p /var/cache/nginx/proxy_temp && \
    mkdir -p /var/cache/nginx/fastcgi_temp && \
    mkdir -p /var/cache/nginx/uwsgi_temp && \
    mkdir -p /var/cache/nginx/scgi_temp && \
    chown -R nginx:nginx /var/cache/nginx && \
    chown -R nginx:nginx /var/run && \
    chown -R nginx:nginx /etc/nginx/conf.d && \
    touch /var/run/nginx.pid && \
    chown -R nginx:nginx /var/run/nginx.pid

# Copy built assets and config
COPY --from=build --chown=nginx:nginx /app/dist /usr/share/nginx/html
COPY --chown=nginx:nginx frontend/nginx.conf /etc/nginx/conf.d/default.conf

# Switch to non-root user
USER nginx

EXPOSE 8080
