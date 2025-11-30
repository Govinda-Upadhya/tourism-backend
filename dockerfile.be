FROM oven/bun

WORKDIR /app/backend/

COPY ./package*.json ./

RUN bun install 

COPY . .

RUN bunx prisma generate

EXPOSE 3000

CMD ["bun","run","dev"]