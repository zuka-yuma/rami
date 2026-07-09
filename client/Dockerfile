FROM node:24-alpine AS builder

WORKDIR /app

COPY package.json /app/

RUN npm install

COPY tsconfig*.json /app/
COPY index.html /app/
COPY vite.config.ts /app/
COPY ./public /app/public
COPY package-lock.json /app/
COPY ./src /app/src

RUN npm run build

FROM nginx:1.31.2-alpine AS runner

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf.template /etc/nginx/templates/default.conf.template

CMD ["nginx", "-g", "daemon off;"]