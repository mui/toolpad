# Contributing

## Local development

If you would like to hack on MUI Toolpad or want to run the latest version, you can follow these steps:

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
   yarn dev13
   ```

1. Run

   ```sh
   cd packages/toolpad
   npm link
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
       "@mui/toolpad-core": "file:/path/to/toolpad/monorepo/toolpad/packages/toolpad-core"
     }
   }
   ```

   replace `/path/to/toolpad/monorepo` with the path to the monorepo on your file system, then run `yarn install --force`.

1. Run `yarn dev`.

### Notes for contributors

- Changes that you make to the prisma model will be automatically compiled, but you'll have to push them to the db manually, either by restarting the `yarn dev` command, or by running

  ```sh
  yarn prisma db push
  ```

- In some cases, after the schema changes, the app may not start up and you may see the message:

  ```sh
  ⚠️  There might be data loss when applying the changes:
  ```

  This means your database is out of sync with the prisma schema and can't be synchronized without data loss. You can synchronise the database manually using:

  ```sh
  yarn prisma db push --accept-data-loss
  ```

## Sending a pull request

Please have a look at our general guidelines for sending pull requests [here](https://mui-org.notion.site/GitHub-PRs-7112d03a6c4346168090b29a970c0154) and [here](https://github.com/mui/material-ui/blob/master/CONTRIBUTING.md#sending-a-pull-request).

## Release process

See [RELEASE.md](./RELEASE.md)
