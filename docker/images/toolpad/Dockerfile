FROM node:16 as base
# TODO: Move to node:16-alpine once https://github.com/prisma/prisma/issues/8478 gets solved

ARG VERSION
LABEL version=$VERSION

RUN \
# Check for mandatory build arguments
    : "${VERSION:?Build argument needs to be set and non-empty.}" \

RUN mkdir /app
WORKDIR /app

RUN npm i -g prisma
RUN npm init --yes


FROM base as builder-base

# When we're on alpine: RUN apk add --no-cache python3 make g++ git
RUN npm i -S @mui/toolpad@$VERSION
RUN prisma generate --schema node_modules/@mui/toolpad-app/prisma/schema.prisma


FROM base as prod

COPY --from=builder-base /app/ /app/
USER node
EXPOSE 3000

CMD ["node_modules/@mui/toolpad/cli.js"]
