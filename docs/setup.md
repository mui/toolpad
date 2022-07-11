# Setup

## docker-compose

The easiest way to run MUI Toolpad locally is through docker-compose.

**NOTE: MUI toolpad is in preview, do not run this in production.**

### prerequisits

Make sure you have the following tools installed:

- Docker
- docker-compose
- git

### Steps

1.  Download the docker compose file

    ```sh
    curl -LO https://raw.githubusercontent.com/mui/mui-toolpad/master/docker/compose/docker-compose.yml
    ```

1.  Start the docker compose services

    ```sh
    docker-compose -f docker/compose/docker-compose.yml up -d
    ```

MUI Toolpad will be accessible under `http://localhost:3000/`.

## Heroku

<!-- TODO -->
