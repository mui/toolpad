# Setup

## docker-compose

The easiest way to run MUI Studio locally is through docker-compose.

### prerequisits

Make sure you have the following tools installed:

- Docker
- docker-compose
- git

### Steps

1.  Check out the repository

```sh
git clone https://github.com/mui/mui-studio.git
cd mui-studio
```

1. Start the docker compose services

```sh
docker-compose -f docker/compose/docker-compose.yml up -d
```

MUI Studio will be accessible under `http://localhost:3000/`.

## Heroku

<!-- TODO -->
