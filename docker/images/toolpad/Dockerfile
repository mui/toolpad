FROM node:16 as base

ARG GIT_SHA1
ENV GIT_SHA1=$GIT_SHA1
LABEL com.mui.toolpad.git-sha1=$GIT_SHA1

ARG CIRCLE_BUILD_NUM
ENV CIRCLE_BUILD_NUM=$CIRCLE_BUILD_NUM
LABEL com.mui.toolpad.circle-build-num=$CIRCLE_BUILD_NUM

WORKDIR /app



FROM base AS deps

COPY ./package.json ./yarn.lock ./
COPY ./packages/eslint-plugin-material-ui/package.json ./packages/eslint-plugin-material-ui/
COPY ./packages/toolpad-app/package.json ./packages/toolpad-app/
COPY ./packages/toolpad-cli/package.json ./packages/toolpad-cli/
COPY ./packages/toolpad-components/package.json ./packages/toolpad-components/
COPY ./packages/toolpad-core/package.json ./packages/toolpad-core/
RUN --mount=type=cache,target=/root/.yarn \
  YARN_CACHE_FOLDER=/root/.yarn \
  yarn cache clean && \
  yarn install --frozen-lockfile



FROM base as builder
COPY --from=deps /app/ ./
COPY . .
RUN --mount=type=cache,target=/root/.yarn \
  yarn release:build && \
  YARN_CACHE_FOLDER=/root/.yarn yarn install --production --ignore-scripts --prefer-offline





FROM base as prod

ENV NODE_ENV production
COPY --from=builder /app/ ./
USER node
EXPOSE 3000
ENV PORT 3000

# TODO: Disable or not?
# ENV NEXT_TELEMETRY_DISABLED 1

CMD ["yarn", "start"]
