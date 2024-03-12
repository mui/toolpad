# Release process

1. Generate a new version using:

   ```bash
   pnpm release:version
   ```

   This command will bump the version in every package of the project.

1. Generate the changelog using:

   ```bash
   pnpm release:changelog
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

1. Open a PR to the `master` branch with the proposed changes. Add the "release" label.

1. Smoke test the release with the [CodeSandbox CI](https://ci.codesandbox.io/status/mui/mui-toolpad) package of the PR branch:

   1. Run

   ```bash
   npx https://pkg.csb.dev/mui/mui-toolpad/commit/<build>/create-toolpad-app smoke --use-pnpm
   cd smoke
   pnpm add https://pkg.csb.dev/mui/mui-toolpad/commit/<build>/@toolpad/studio -S
   pnpm dedupe && pnpm dev
   ```

   And verify the editor works

1. Merge the PR changes, then check out the `master` branch and pull the last commit.

1. Publish the package to `npm`

   1. If you are not logged in to `npm` in your CLI, first log in with:

      ```bash
      npm login
      ```

   1. Publish to `npm`

      ```bash
      pnpm release:publish
      ```

      If you've created a prerelease, then instead use

      ```bash
      pnpm release:publish-canary
      ```

1. Publish the documentation. The documentation must be updated on the `docs-latest` branch.

   ```bash
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
