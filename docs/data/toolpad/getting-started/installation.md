# Installation

<p class="description">Setup Toolpad to run on your own machine.</p>

## Installing Docker

In order to run Toolpad you will need to have Docker set up on your machine. Follow [official instructions](https://www.docker.com/get-started/) to get started.

## Downloading Toolpad

Toolpad runs inside a docker container so you first need to download the docker compose file. Run following command in your terminal:

```sh
curl -LO https://raw.githubusercontent.com/mui/mui-toolpad/master/docker/compose/docker-compose.yml
```

## Running Toolpad

Now you need to run the docker container by running the following command:

```sh
docker-compose -f docker-compose.yml up -d
```

## Opening Toolpad

You should now be able to open Toolpad on http://localhost:3000/.
