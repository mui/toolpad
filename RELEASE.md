# Release process

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

   Writing good highlights:

   - Focus on new user facing features or changes
   - Be concise, link to relevant documentation for extra clarity

1. Prepend the changelog to [`CHANGELOG.md`](./CHANGELOG.md).

1. Open a PR with the proposed changes.

1. Review/merge the PR — once the PR is merged to `master` a Docker image is built for the commit, tagged with the commit SHA and then pushed to Docker Hub, just like for any other commit in `master`.

1. Wait for the Docker build to finish. (You can find the job in the [CircleCI pipelines](https://app.circleci.com/pipelines/github/mui/mui-toolpad?branch=master)). Note that you can always verify the built docker image by running it as

   ```sh
   TAG=<git-sha> docker-compose -f docker/compose/docker-compose.yml up
   ```

   Where `<git-sha>` is the commit on master that you want to test.

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

## npm

For now using this to publish

```sh
yarn lerna publish --force-publish --no-git-tag-version --no-push
```

** TODO: work out full flow **
