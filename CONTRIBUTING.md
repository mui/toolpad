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
       "@mui/toolpad-components": "portal:<your-local-toolpad-monorepo>/packages/toolpad-components"
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

### Notes for contributors

- Changes that you make to the prisma model will be automatically compiled, but you'll have to push them to the db manually, either by restarting the `yarn dev` command, or by running

  ```sh
  yarn prisma db push
  ```

- In some cases, after the schema changes, the app may not start up and you may see the message:

  ```sh
  ⚠️  There might be data loss when applying the changes:
  ```

  This means your database is out of sync with the prisma schema and can't be synchronized without data loss. You can synchronize the database manually using:

  ```sh
  yarn prisma db push --accept-data-loss
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

## Sending a pull request

Please have a look at our general guidelines for sending pull requests [here](https://mui-org.notion.site/GitHub-PRs-7112d03a6c4346168090b29a970c0154) and [here](https://github.com/mui/material-ui/blob/master/CONTRIBUTING.md#sending-a-pull-request).

## Release process

See [RELEASE.md](./RELEASE.md)
