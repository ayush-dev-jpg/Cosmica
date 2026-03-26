# frontend/Dockerfile
# Stage 1: Build React app
FROM node:18-alpine AS builder

WORKDIR /app
COPY package.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine

# Copy built React files to Nginx
COPY --from=builder /app/build /usr/share/nginx/html

# Custom Nginx config to handle React Router (SPA routing)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
