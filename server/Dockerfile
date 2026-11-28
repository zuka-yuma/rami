FROM node:24-alpine AS builder

WORKDIR /app
COPY ./src /app/src
COPY ./prisma /app/prisma
COPY package.json package-lock.json tsconfig.json prisma.config.ts /app/


RUN npm ci && npx prisma generate && npm run build

FROM node:24-alpine AS runner

WORKDIR /app
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/package.json /app/prisma.config.ts ./
COPY --from=builder /app/package-lock.json ./

RUN npm ci --omit=dev --omit=optional --omit=peer

COPY --from=builder /app/dist ./dist

CMD ["node", "dist/index.js"]
