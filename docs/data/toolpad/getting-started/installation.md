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

1. Run the docker compose services with:

   ```sh
   docker-compose -f docker-compose.yml up -d
   ```

1. Build and deploy applications on http://localhost:3000/.

## With Kubernetes

### Prerequisites

- A Kubernetes cluster (a local one via `kind` or a remote one)
- The `kind` command line tool installed on your machine. Follow the [official instructions](https://kind.sigs.k8s.io/docs/user/quick-start/) to install `kind`.
- The `kubectl` command line tool installed on your machine. Follow the [official instructions](https://kubernetes.io/docs/tasks/tools/install-kubectl/) to install `kubectl`.

### Steps

1. Download the Toolpad Kubernetes manifest file:

   ```sh
   curl -LO https://raw.githubusercontent.com/mui/mui-toolpad/master/kubernetes/toolpad.yml
   ```

1. Create a Kubernetes cluster with `kind`:

   ```sh
   kind create cluster
   ```

1. Deploy Toolpad to the cluster using `kubectl`:

   ```sh
   kubectl apply -f kubernetes/toolpad.yaml
   ```

1. Forward a local port to the Toolpad application server:

   ```sh
   kubectl -n toolpad port-forward deployment/toolpad 3000:3000
   ```

1. Browse at http://localhost:3000/.
