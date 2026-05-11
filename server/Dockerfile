FROM node:22-alpine

WORKDIR /app
COPY ./src /app/src
COPY ./prisma /app/prisma
COPY package.json tsconfig.json prisma.config.ts /app/

RUN npm install && npx prisma generate && npm run build && cp -r /app/src/generated /app/dist/generated

CMD ["npm", "start"]
