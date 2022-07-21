# Contributing

## Local development

If you would like to hack on MUI Toolpad or want to run the latest version, you can follow these steps:

### Prerequisites

- git
- node.js
- Docker
- docker-compose

### Steps

1. Start a local database:

   ```sh
   docker-compose -f ./docker-compose.dev.yml up -d
   ```

   You can skip this step if you already have a development database available by other means. Use the following command to stop the running container:

   ```sh
   docker-compose -f ./docker-compose.dev.yml down
   ```

1. Install dependencies:

   ```sh
   yarn install
   ```

1. Create a `.env` file in the root of the project

   ```sh
   TOOLPAD_DATABASE_URL=postgres://postgres:postgres@localhost:5432/postgres
   # For a custom port:
   # PORT=3004
   # EXTERNAL_URL=http://localhost:3004/
   ```

1. Now you can run the MUI Toolpad dev command to start the application

   ```sh
   yarn dev
   ```

1. Open [`http://localhost:3000/`](http://localhost:3000/) in your browser.

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

## Release process

1. Generate a new version using

   ```sh
   yarn release:version
   ```

1. Generate changelog using

   ```sh
   yarn release:changelog
   ```

1. Clean the generated changelog, add highlights, use the new version number as title

1. prepend the changelog to [`CHANGELOG.md`](./CHANGELOG.md)

1. Open a PR with the proposed changes

1. Review/merge PR

1. Wait for the docker build to finish.

1. Release the docker image using:

   ```sh
   # add --prerelease if necessary
   yarn release:docker --commit <commit of merged PR> --releaseTag <version number>
   ```

1. Create a new github release, use `<version number>` as the tag and `<commit of merged PR>` as the target. Use the cleaned changelog as the body and the `<version number>` as the title. Mark as prerelease if necessary.
