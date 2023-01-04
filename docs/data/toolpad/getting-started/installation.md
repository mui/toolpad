# Installation

<p class="description">Setup Toolpad to run on your own machine.</p>

## With Docker

### Prerequisites

- A Docker and Docker Compose installation. Follow [official instructions](https://www.docker.com/get-started/) to get started.

### Steps

1. Download our basic Docker Compose configuration:

   ```sh
   curl -LO https://raw.githubusercontent.com/mui/mui-toolpad/master/docker/compose/docker-compose.yml
   ```

   This file contains a basic configuration, setting up a database and the Toolpad application server. You can use it as a starting point or for local development.

2. Run the docker compose services with:

   ```sh
   docker-compose -f docker-compose.yml up -d
   ```

3. Build and deploy applications on http://localhost:3000/.
