# Contributing

## Local development

If you would like to hack on MUI Studio or want to run the latest version, you can follow these steps:

### Prerequisites:

- git
- node.js
- Docker
- docker-compose

### Steps:

1. Start a local database:

   ```sh
   docker-compose up -d
   ```

   You can skip this step if you already have a development database available by other means. Use the following command to stop the running container:

   ```sh
   docker-compose down
   ```

1. Install dependencies and start building the project in watch mode:

   ```sh
   yarn install
   yarn dev
   ```

1. Create a `.env` file in the root of the project

   ```sh
   TOOLPAD_DATABASE_URL=postgres://postgres:postgres@localhost:5432/postgres
   ```

1. Now you can run the MUI Studio cli to start the application

   ```sh
   yarn cli
   ```

1. Open [`http://localhost:3000/`](http://localhost:3000/) in your browser.

### Notes for contributors:

- Changes that you make to the prisma model will be automatically compiled, but you'll have to push them to the db manually, either by restarting the `yarn cli` command, or by running

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

## Release process

### release

1. Build packages

   ```sh
   yarn release:build
   ```

1. Cut a new release

   ```sh
   yarn release:version <prerelease/patch/minor/major>
   ```

1. Publish release

   ```sh
   yarn release:publish
   ```

1. Build docker image

   ```sh
   yarn release:docker:build
   ```

1. Publish docker images. Make sure you are logged in to docker (`docker login`):

   ```sh
   yarn release:docker:publish
   ```

### Dryrun publish

For testing purposes, it is possible to try out publishing

1. Start local npm registry

   ```sh
   npx verdaccio
   ```

1. You may have to increase max allowed uploaded body size. To do so, locate your verdaccio config file and add:

   ```yml
   max_body_size: 100mb # Or whatever size is needed
   ```

1. Publish packages using the command

   ```sh
   yarn release:publish:dry-run
   ```

1. packages can be installed by appending `--registry=http://localhost:4873/` to `yarn`/`npm` commands, or by providing environment variable `npm_config_registry=http://localhost:4873/` (The latter seems to be needed for `npx`, as in `npm_config_registry=http://localhost:4873/ npx @mui/studio`)
