FROM node:22-alpine AS builder

RUN apk add --no-cache libc6-compat openssl

WORKDIR /app

COPY package.json pnpm-lock.yaml ./
COPY prisma ./prisma/

RUN corepack enable

RUN pnpm install --frozen-lockfile

COPY . .

RUN pnpm run db:generate

RUN pnpm run build

FROM node:22-alpine AS production

RUN apk add --no-cache libc6-compat openssl

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nestjs

WORKDIR /app

RUN corepack enable

COPY package.json pnpm-lock.yaml ./
COPY prisma ./prisma/

RUN pnpm install --frozen-lockfile

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/generated ./generated

RUN pnpm run db:generate

RUN chown -R nestjs:nodejs /app
USER nestjs

EXPOSE 3000

CMD ["pnpm", "run", "start:dev"]