# Deploy to Render

<p class="description">You can host and share your Toolpad Studio apps on Render in a few minutes, for free.</p>

## Prerequisites

- A [Render](https://render.com) account
- A [GitHub](https://github.com) account

## Pushing your Toolpad Studio app to GitHub

1. With a GitHub account, you can create a new repository using the **+** button available in the header menu, followed by **New repository**. Then, select an appropriate name:

{{"component": "modules/components/DocsImage.tsx", "src": "/static/toolpad/docs/studio/tutorials/deploy-render/render-github-new.png", "alt": "GitHub new repo ", "caption": "Creating a new GitHub repository", "indent": 1, "aspectRatio": 1 }}

2. If the Toolpad Studio app is not currently a Git repository, you can run

   ```bash
   git init
   ```

   to initialise it.

3. You can set the newly created repository on GitHub as the remote for your locally running Toolpad Studio app, using:

   ```bash
   git remote add origin <REPOSITORY-URL>
   ```

   Replace `<REPOSITORY-URL>` with the URL of the repository you just created on GitHub.

4. Once you are done making changes to your Toolpad Studio app, verify that you are on the `main` branch, commit these changes and push them to GitHub.

   ```bash
   git add .
   git commit -m "pushing a new version"
   git push origin main
   ```

## Creating a new app on Render

1. With a Render account, you can create a new **Web Service**:

{{"component": "modules/components/DocsImage.tsx", "src": "/static/toolpad/docs/studio/tutorials/deploy-render/render-start.png", "alt": "Render new web service ", "caption": "Creating a new Render Web Service", "indent": 1 }}

2. Depending on whether the visibility of the GitHub repository is set to private or public, you will need to either connect your GitHub account to Render, or paste in the URL of the repository you created above:

{{"component": "modules/components/DocsImage.tsx", "src": "/static/toolpad/docs/studio/tutorials/deploy-render/render-connect-github.png", "alt": "GitHub new repo ", "caption": "Connecting GitHub to Render", "indent": 1, "aspectRatio": 2 }}

3. If using a private repository, you need to search for and select the repository you intend to deploy once connected to GitHub:

{{"component": "modules/components/DocsImage.tsx", "src": "/static/toolpad/docs/studio/tutorials/deploy-render/render-search.png", "alt": "GitHub repo on Render ", "caption": "Connecting your GitHub repository", "indent": 1, "aspectRatio": 1.5}}

4. With the repository selected, you can advance to deployment configuration. Render can guess that you are deploying a Node app. Set the name which will appear in the URL of your deployed app, like `<APP-NAME>.onrender.com`:

{{"component": "modules/components/DocsImage.tsx", "src": "/static/toolpad/docs/studio/tutorials/deploy-render/render-config-start.png", "alt": "Render deployment config ", "caption": "Setting the deployment configuration", "indent": 1 }}

5. The build and start commands will be set to

   ```bash
   $ yarn; yarn build
   $ yarn start
   ```

   by default. You can leave this unchanged.

6. Select an appropriate instance type for your deployment.

{{"component": "modules/components/DocsImage.tsx", "src": "/static/toolpad/docs/studio/tutorials/deploy-render/render-config-commands.png", "alt": "Render deployment commands and plan ", "caption": "Setting deployment commands and choosing an instance type", "indent": 1 }}

7. Select **Create Web Service** to trigger the deployment. You will be redirected to the streaming logs of the in-progress deployment.

8. Render.com uses `14.7.0` as the default Node version. Toolpad Studio requires version `18.17.1` as the minimum Node version. You can change the default by setting a `NODE_VERSION` environment variable for your deployment:

{{"component": "modules/components/DocsImage.tsx", "src": "/static/toolpad/docs/studio/tutorials/deploy-render/node-version.png", "alt": "Set NODE_VERSION ", "caption": "Overriding the default Node version", "indent": 1, "aspectRatio": 3 }}

<ul style="list-style-type: none">
<li>

:::info
See the [Render documentation](https://docs.render.com/node-version) on Node versions for more information.
:::

</li>
</ul>

8. Once this is successfully complete, you can access your Toolpad Studio app on `<APP-NAME>.onrender.com`.

{{"component": "modules/components/DocsImage.tsx", "src": "/static/toolpad/docs/studio/tutorials/deploy-render/render-complete.png", "alt": "Render deployment complete ", "caption": "Deployed successfully", "indent": 1 }}

That's it! We're up and running in a few minutes.

Make changes, push to GitHub, and your app will automatically redeploy each time.

Check out the Render documentation for more advanced settings, like adding [environment variables](https://docs.render.com/configure-environment-variables) to your app.
