# syntax=docker/dockerfile:1
FROM node:20-bookworm-slim AS base
WORKDIR /usr/src/app/chimimoryo

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
ENV NODE_ENV="production"

RUN corepack enable

COPY . .

FROM base AS installer
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --prod --frozen-lockfile

FROM base AS builder
ENV NODE_ENV="development"

RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
RUN pnpm run build

FROM base AS runner
RUN adduser --system --uid 1001 chimimoryo

COPY --from=installer --chown=chimimoryo:node /usr/src/app/chimimoryo/node_modules /usr/src/app/chimimoryo/node_modules
COPY --from=builder --chown=chimimoryo:node /usr/src/app/chimimoryo/dist /usr/src/app/chimimoryo/dist

USER chimimoryo

CMD [ "pnpm", "start" ]
