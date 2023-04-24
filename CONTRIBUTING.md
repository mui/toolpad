# Contributing

## Local development

If you would like to hack on MUI Toolpad or want to run the latest version, you can follow these steps:

_If you're looking into contributing to the docs, follow the [instructions](#building-and-running-the-documentation) down below_

### Prerequisites

- git
- node.js

### Steps

1. Install dependencies:

   ```sh
   yarn install
   ```

1. Run the build in watch mode

   ```sh
   yarn dev
   ```

1. In another folder, start a toolpad project using:

   ```json
   {
     "name": "toolpad-local",
     "version": "1.0.0",
     "license": "MIT",
     "scripts": {
       "dev": "toolpad dev --dev",
       "build": "toolpad build --dev",
       "start": "toolpad start --dev"
     },
     "dependencies": {
       "@mui/toolpad": "portal:<your-local-toolpad-monorepo>/packages/toolpad"
     },
     "resolutions": {
       "@mui/toolpad-app": "portal:<your-local-toolpad-monorepo>/packages/toolpad-app",
       "@mui/toolpad-core": "portal:<your-local-toolpad-monorepo>/packages/toolpad-core",
       "@mui/toolpad-components": "portal:<your-local-toolpad-monorepo>/packages/toolpad-components",
       "@mui/toolpad-utils": "portal:<your-local-toolpad-monorepo>/packages/toolpad-utils"
     }
   }
   ```

   1. Replace `<your-local-toolpad-monorepo>` with the path to the toolpad monorepo on your file system. Make sure to keep `portal:`.

   1. In order to use `portal:` dependencies, we will need to use yarn 2. So start by running

      ```sh
      yarn set version berry
      ```

      and add to the `.yarnrc.yml`:

      ```yaml
      nodeLinker: node-modules
      ```

   1. then run

      ```sh
      yarn install
      ```

1. Run start toolpad in dev mode:

   ```sh
   yarn dev
   ```

## Building and running the documentation

1. If you haven't already, install the project dependencies using

   ```sh
   yarn
   ```

1. To start the documentation application in dev mode run

   ```sh
   yarn docs:dev
   ```

   If all goes well it should print

   ```sh
   ready - started server on 0.0.0.0:3003, url: http://localhost:3003
   ```

1. Open the docs application in the browser [http://localhost:3003/toolpad](http://localhost:3003/toolpad)

## Reviewing PRs

- Check out the PR branch locally with your tool of choice ([GitHub Docs](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/reviewing-changes-in-pull-requests/checking-out-pull-requests-locally?tool=cli))
- Run to build the project

  ```sh
  yarn && yarn release:build
  ```

- Run it on your project of choice

  ```sh
  yarn toolpad dev /path/to/my/toolpad/project
  ```

## Integration tests

- To run Toolpad on a fixture

  ```sh
  yarn toolpad dev --dev ./path/to/fixture
  ```

- To run the tests locally in production mode

  ```sh
  yarn build:release
  yarn test:integration --project chromium
  ```

- To run the tests locally in dev mode

  ```sh
  yarn dev
  ```

  then run

  ```sh
  TOOLPAD_NEXT_DEV=1 yarn test:integration --project chromium
  ```

- Use the `--ui` flag to run the tests interactively

## Sending a pull request

Please have a look at our general [guidelines](https://github.com/mui/material-ui/blob/master/CONTRIBUTING.md#sending-a-pull-request) for sending pull requests.

## Release process

See [RELEASE.md](./RELEASE.md)
