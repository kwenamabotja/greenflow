# GreenFlow — multi-stage build (API bundle + static frontend + nginx)
# -----------------------------------------------------------------------------
FROM node:24-bookworm-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && corepack prepare pnpm@10.33.0 --activate
WORKDIR /app

# -----------------------------------------------------------------------------
FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.base.json tsconfig.json ./
COPY artifacts ./artifacts
COPY lib ./lib
COPY scripts ./scripts

RUN pnpm install --frozen-lockfile

# -----------------------------------------------------------------------------
FROM deps AS build

ARG FRONTEND_PORT=5173
ARG BASE_PATH=/
ARG VITE_CLERK_PUBLISHABLE_KEY=
ARG CLERK_PUBLISHABLE_KEY=

ENV PORT=${FRONTEND_PORT}
ENV BASE_PATH=${BASE_PATH}
ENV VITE_CLERK_PUBLISHABLE_KEY=${VITE_CLERK_PUBLISHABLE_KEY}
ENV CLERK_PUBLISHABLE_KEY=${CLERK_PUBLISHABLE_KEY}

RUN pnpm --filter @workspace/api-server run build \
  && pnpm --filter @workspace/greenflow run build

# -----------------------------------------------------------------------------
FROM node:24-bookworm-slim AS api
WORKDIR /app

RUN groupadd --gid 1001 nodejs && useradd --uid 1001 --gid nodejs --shell /bin/bash --create-home nodejs

COPY --from=build --chown=nodejs:nodejs /app/artifacts/api-server/dist ./dist

USER nodejs
ENV NODE_ENV=production
EXPOSE 8000
CMD ["node", "--enable-source-maps", "dist/index.mjs"]

# -----------------------------------------------------------------------------
FROM nginx:1.27-alpine AS web
COPY docker/nginx/default.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/artifacts/greenflow/dist/public /usr/share/nginx/html

EXPOSE 80
