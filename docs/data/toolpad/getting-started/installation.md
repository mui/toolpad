# Installation

<p class="description">Setup Toolpad to run on your own machine.</p>

## Installing Docker

In order to run Toolpad you will need to have Docker set up on your machine. Follow [official instructions](https://www.docker.com/get-started/) to get started.

## Downloading Toolpad

Toolpad runs inside a docker container. An in order to run Toolpad you will first need to download docker compose file. Run following command in your terminal:

```sh
curl -LO https://raw.githubusercontent.com/mui/mui-toolpad/master/docker/compose/docker-compose.yml
```

## Running Toolpad

Once Docker is installed and docker compose file is downloaded you can run Toolpad on your machine by running following command:

```sh
docker-compose -f docker-compose.yml up -d
```

## Opening Toolpad

After a few momemnts you should be able to open Toolpad on http://localhost:3000/.
