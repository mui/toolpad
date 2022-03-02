# MUI Studio

## Local development

### Prerequisites:

- git
- yarn
- node.js
- docker

### Setting up your development environment:

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
   STUDIO_DATABASE_URL=postgres://postgres:postgres@localhost:5432/postgres
   ```

1. Now you can run the MUI Studio cli to start the application

   ```sh
   yarn cli
   ```

1. Open [`http://localhost:3000/`](http://localhost:3000/) in your browser.

### Notes:

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

This is a test

https://samplelib.com/lib/preview/mp4/sample-5s.mp4
