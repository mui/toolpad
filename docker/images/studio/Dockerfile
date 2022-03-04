FROM node:16 as base
# TODO: Move to node:16-alpine when https://github.com/prisma/prisma/issues/8478 gets solved

ARG VERSION=0.0.3
LABEL version=$VERSION

WORKDIR /app
RUN npm i -g prisma
RUN npm init --yes


FROM base as builder-base

# When we're on alpine: RUN apk add --no-cache python3 make g++ git
RUN npm i -S @mui/studio@$VERSION
RUN prisma generate --schema node_modules/@mui/studio-app/prisma/schema.prisma


FROM base as prod

COPY --from=builder-base /app/ /app/
USER node

CMD ["node_modules/@mui/studio/cli.js"]