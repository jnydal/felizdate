# syntax=docker/dockerfile:1.7

ARG VITE_API_BASE_URL=http://localhost:8000
ARG VITE_WS_HOST=localhost:8080
ARG VITE_WS_PATH=/ws/chat/

FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm install
COPY . .

ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}
ENV VITE_WS_HOST=${VITE_WS_HOST}
ENV VITE_WS_PATH=${VITE_WS_PATH}

RUN npm run build

FROM nginx:1.27-alpine AS runtime
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80

