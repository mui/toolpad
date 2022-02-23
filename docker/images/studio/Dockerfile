FROM node:16 as builder-base

WORKDIR /app

# RUN apk add --no-cache python3 make g++ git

COPY ./package.json ./yarn.lock ./lerna.json /app/
COPY ./packages/eslint-plugin-material-ui/package.json /app/packages/eslint-plugin-material-ui/
COPY ./packages/studio-app/package.json /app/packages/studio-app/
COPY ./packages/studio-cli/package.json /app/packages/studio-cli/
COPY ./packages/studio-components/package.json /app/packages/studio-components/
COPY ./packages/studio-core/package.json /app/packages/studio-core/

FROM builder-base as builder-dev

RUN npm_config_platform=linux yarn install --frozen-lockfile --verbose

COPY ./packages /app/

RUN yarn build

FROM builder-base as builder-prod

RUN npm_config_platform=linux yarn install --frozen-lockfile --verbose --production

FROM node:16 as app

USER node

COPY --from=builder-prod /app/node_modules /app
COPY --from=builder-dev /app/package.json /app/packages /app

CMD ["yarn", "cli"]