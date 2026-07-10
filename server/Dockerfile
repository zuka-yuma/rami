FROM node:24-alpine AS builder

WORKDIR /app
COPY ./src /app/src
COPY ./prisma /app/prisma
COPY package.json tsconfig.json prisma.config.ts /app/
COPY entrypoint.sh /usr/local/bin

RUN npm install && npx prisma generate && npm run build && cp -r /app/src/generated /app/dist/generated

FROM node:24-alpine AS runner

COPY --from=builder /app/dist /dist
COPY --from=builder /app/prisma /prisma
COPY --from=builder /app/package.json /app/prisma.config.ts /
COPY --from=builder /app/node_modules /node_modules
COPY --from=builder /usr/local/bin/entrypoint.sh /usr/local/bin/entrypoint.sh 
RUN chmod +x /usr/local/bin/entrypoint.sh

ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]

CMD ["npm", "start"]

