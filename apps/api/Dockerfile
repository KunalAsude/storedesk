# API image (build from the repo root: docker build -f apps/api/Dockerfile .).
# Runs on Render free now and on AWS (ECS/EC2) later without changes.
FROM oven/bun:1.4.5-slim AS deps
WORKDIR /app
# Manifests of the API and the packages it uses, so this layer is cached until dependencies change.
# --filter installs only what @storedesk/api needs (no Next/React from apps/web).
COPY package.json bun.lock ./
COPY apps/api/package.json apps/api/
COPY packages/db/package.json packages/db/
COPY packages/shared/package.json packages/shared/
RUN bun install --frozen-lockfile --production --filter "@storedesk/api"

FROM oven/bun:1.4.5-slim
WORKDIR /app
ENV NODE_ENV=production
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/api/node_modules ./apps/api/node_modules
COPY --from=deps /app/packages ./packages
# tsconfig.base.json: apps/api/tsconfig.json extends it (enables the decorators NestJS needs).
COPY package.json tsconfig.base.json ./
COPY apps/api ./apps/api
COPY packages/db ./packages/db
COPY packages/shared ./packages/shared
USER bun
EXPOSE 4000
# Render's free plan has no pre-deploy step: apply migrations, then start the API.
# A failed migration stops the container, so the old version keeps serving.
# Started from apps/api (like `bun run dev:api`) so Bun uses apps/api/tsconfig.json.
CMD ["sh", "-c", "bun packages/db/src/migrate.ts && cd apps/api && exec bun src/main.ts"]
