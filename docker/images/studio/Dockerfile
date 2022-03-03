# TODO: Move to node:16-alpine when https://github.com/prisma/prisma/issues/8478 gets solved
FROM node:16 as base

WORKDIR /app
RUN npm init --yes



FROM base as builder-base

# RUN apk add --no-cache python3 make g++ git
RUN npm i -g prisma
RUN npm i -S @mui/studio@latest
RUN prisma generate --schema node_modules/@mui/studio-app/prisma/schema.prisma


FROM base as prod

COPY --from=builder-base /app/ /app/
USER node

CMD ["node_modules/@mui/studio/cli.js"]