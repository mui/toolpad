# Setup

## docker-compose

The easiest way to run MUI Toolpad locally is through docker-compose.

### prerequisits

Make sure you have the following tools installed:

- Docker
- docker-compose
- git

### Steps

1.  Check out the repository

```sh
git clone https://github.com/mui/mui-toolpad.git
cd mui-toolpad
```

1. Start the docker compose services

```sh
docker-compose -f docker/compose/docker-compose.yml up -d
```

MUI Toolpad will be accessible under `http://localhost:3000/`.

## Heroku

<!-- TODO -->
