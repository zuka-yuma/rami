FROM node:24-alpine AS builder

WORKDIR /app
COPY ./src /app/src
COPY ./prisma /app/prisma
COPY package.json tsconfig.json prisma.config.ts /app/

RUN npm install && npx prisma generate && npm run build

FROM node:24-alpine AS runner

COPY --from=builder /app/dist /dist
COPY --from=builder /app/prisma /prisma
COPY --from=builder /app/package.json /app/prisma.config.ts /
COPY --from=builder /app/node_modules /node_modules

CMD ["npm", "start"]
