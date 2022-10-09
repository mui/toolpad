FROM node:18.10.0 as base

ARG GIT_SHA1
ENV GIT_SHA1=$GIT_SHA1
LABEL com.mui.toolpad.git-sha1=$GIT_SHA1

ARG CIRCLE_BUILD_NUM
ENV CIRCLE_BUILD_NUM=$CIRCLE_BUILD_NUM
LABEL com.mui.toolpad.circle-build-num=$CIRCLE_BUILD_NUM

ENV YARN_CACHE_FOLDER=/root/caches/.yarn

WORKDIR /app

RUN --mount=type=cache,target=/root/caches \ 
  yarn cache clean




FROM base AS deps

COPY ./package.json ./yarn.lock ./
COPY ./packages/eslint-plugin-material-ui/package.json ./packages/eslint-plugin-material-ui/
COPY ./packages/toolpad-app/package.json ./packages/toolpad-app/
COPY ./packages/toolpad-components/package.json ./packages/toolpad-components/
COPY ./packages/toolpad-core/package.json ./packages/toolpad-core/
RUN --mount=type=cache,target=/root/caches \
  yarn install --frozen-lockfile



FROM base as builder
COPY --from=deps /app/ ./
COPY . .
RUN --mount=type=cache,target=/root/caches \
  yarn release:build && \
  yarn install --production --ignore-scripts --prefer-offline





FROM base as prod

ENV NODE_ENV production
ENV YARN_CACHE_FOLDER=
USER node
COPY --from=builder --chown=node /app/ ./
EXPOSE 3000
ENV PORT 3000

# TODO: Disable or not?
# ENV NEXT_TELEMETRY_DISABLED 1

CMD ["yarn", "start"]
