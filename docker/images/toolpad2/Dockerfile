FROM node:16 as base

ARG VERSION
LABEL version=$VERSION

RUN \
# Check for mandatory build arguments
    : "${VERSION:?Build argument needs to be set and non-empty.}" \

RUN mkdir /app
WORKDIR /app



FROM base AS deps
WORKDIR /app

COPY ./package.json ./yarn.lock ./
COPY ./packages/eslint-plugin-material-ui/package.json ./packages/eslint-plugin-material-ui/
COPY ./packages/toolpad-app/package.json ./packages/toolpad-app/
COPY ./packages/toolpad-cli/package.json ./packages/toolpad-cli/
COPY ./packages/toolpad-components/package.json ./packages/toolpad-components/
COPY ./packages/toolpad-core/package.json ./packages/toolpad-core/
RUN yarn install --frozen-lockfile




FROM base as builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN yarn release:build && yarn install --production --ignore-scripts --prefer-offline





FROM base as prod

ENV NODE_ENV production
COPY --from=builder /app/ /app/
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001
USER nextjs
EXPOSE 3000
ENV PORT 3000

# TODO: Disable or not?
# ENV NEXT_TELEMETRY_DISABLED 1

CMD ["yarn", "start"]
