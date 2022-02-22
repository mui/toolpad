# MUI Studio

## Set up your development environment

Prerequisites:

- git
- yarn
- node.js
- docker (unless you have a Postgres database ready to connect to)

1. Clone the repository
1. Start a local database:

   ```sh
   docker-compose up -V
   ```

   You can skip this step if you have a development database available by other means.

1. Install dependencies:

   ```sh
   yarn install
   ```

1. Start building the project in watch mode:

   ```sh
   yarn dev
   ```

1. Initialize the database

   ```sh
   yarn prisma migrate dev
   ```

   and create a `.env` file in the root of the project

   ```sh
   STUDIO_DATABASE_URL=postgres://postgres:postgres@localhost:5432/postgres
   ```

1. Now you can run the MUI Studio cli to start the application

   ```sh
   yarn cli
   ```

1. Open `http://localhost:3000/` in your browser.
