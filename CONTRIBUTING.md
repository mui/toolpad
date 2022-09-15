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

## Sending a pull request

Please have a look at our general guidelines for sending pull requests [here](https://mui-org.notion.site/GitHub-PRs-7112d03a6c4346168090b29a970c0154) and [here](https://github.com/mui/material-ui/blob/master/CONTRIBUTING.md#sending-a-pull-request).

## Release process

1. Generate a new version using:

   ```sh
   yarn release:version
   ```

   This command will bump the version in every package of the project.

1. Generate the changelog using:

   ```sh
   yarn release:changelog
   ```

   Running this command requires a [GitHub personal access token](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token) with the `public_repo` scope.

   Set `GITHUB_TOKEN` variable in `.env` file so to avoid passing it with command every time

   **OR**

   pass token with argument `--githubToken YOUR_TOKEN`

1. Copy the generated changelog from the console, clean it up, add a short summary of the release highlights and use the new version number as the title.

1. Prepend the changelog to [`CHANGELOG.md`](./CHANGELOG.md).

1. Open a PR with the proposed changes.

1. Review/merge the PR — once the PR is merged to `master` a Docker image is built for the commit, tagged with the commit SHA and then pushed to Docker Hub, just like for any other commit in `master`.

1. Wait for the Docker build to finish. (You can find the job in the [CircleCI pipelines](https://app.circleci.com/pipelines/github/mui/mui-toolpad?branch=master))

1. Release the Docker image using (requires GitHub authentication token):

   ```sh
   # add --prerelease if necessary
   yarn release:docker
   ```

   This command runs a GitHub action that retags the Docker image of the release commit in `master` to the version being released and also to "latest", and pushes those new tags. During the release, no new Docker images are created.

1. Publish the documentation. The documentation must be updated on the `docs-latest` branch.

   ```sh
   git push upstream master:docs-latest -f
   ```

   You can follow the deployment process on the [Netlify Dashboard](https://app.netlify.com/sites/mui-toolpad-docs/deploys?filter=docs-latest). Once deployed, it will be accessible at https://mui-toolpad-docs.netlify.app/.

1. [Create a new GitHub release](https://github.com/mui/mui-toolpad/releases/new).
   1. Use `<version number>` to **Choose a tag** (when you enter new version GH UI will pop a suggestion `Create new tag: *** on publish`)
   1. Use `<commit of merged PR>` as the **target**
   1. Use the cleaned changelog as the content of **Describe this release**
   1. Use `<version number>` as the **Release title**
   1. Mark as prerelease if necessary.
   1. **Publish release**
