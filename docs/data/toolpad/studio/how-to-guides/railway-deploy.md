# Deploy to Railway

<p class="description">You can host and share your Toolpad Studio apps on Railway in a few minutes, for free.</p>

This guide walks you throught the deployment of [qr-generator](https://github.com/mui/mui-toolpad/tree/master/examples/qr-generator) example from the Toolpad repository.

## Prerequisites

- A [Railway](https://railway.app/) account
- A [GitHub](https://github.com) account
- A GitHub repository containing Toolpad Studio app. Check out [pushing Toolpad Studio app to GitHub](/toolpad/studio/how-to-guides/render-deploy/#pushing-your-toolpad-studio-app-to-github) for this step.

## Creating a new app on Railway

1. From your Railway dashboard, click on **New Project** from the top-right corner and choose **Deploy from GitHub repo** form the drop-down.

{{"component": "modules/components/DocsImage.tsx", "src": "/static/toolpad/docs/studio/deploy-railway/railway-create-new-project.png", "alt": "Railway new project", "caption": "Creating a new Railway project", "indent": 1 }}

2. Depending on whether the visibility of the repository is set to private or public, you may need to connect your GitHub account to Railway using **Configure GitHub App**. Once done, you'll see a list of repositories to choose from.

{{"component": "modules/components/DocsImage.tsx", "src": "/static/toolpad/docs/studio/deploy-railway/choose-repository.png", "alt": "Choosing the repository", "caption": "Choosing the repository", "indent": 1 }}

3. Select the repository and click **Deploy Now**. Railway can guess that you are deploying a Node app.

4. The default build may fail as some config changes are required. On the deployment screen, you'll see four tabs, navigate to the **Settings** tab and update the root directory as shown below.

{{"component": "modules/components/DocsImage.tsx", "src": "/static/toolpad/docs/studio/deploy-railway/configure-root-directory.png", "alt": "Configuring the root directory", "caption": "Configuring the root directory", "indent": 1 }}

5. Scroll down and click on **Generate Domain** to create a public URL, you can also create a custom URL.

{{"component": "modules/components/DocsImage.tsx", "src": "/static/toolpad/docs/studio/deploy-railway/generate-domain.png", "alt": "Generating a public URL", "caption": "Generating a public URL", "indent": 1 }}

6. The build and start commands commands are set to

   ```bash
   $ npm run build
   $ npm run start
   ```

   by default. You can leave this unchanged.

7. Toolpad Studio apps run on PORT 3000, navigate to the Variables tab add a PORT variable and set its value to 3000.

{{"component": "modules/components/DocsImage.tsx", "src": "/static/toolpad/docs/studio/deploy-railway/add-port-as-a-variable.png", "alt": "Adding port as a variable", "caption": "Adding PORT as a variable", "indent": 1 }}

8. Once this is successfully complete, you can access your Toolpad Studio app from the public URL available on the card.

That's it! The app is up and [running](https://mui-toolpad-qr-generator-production.up.railway.app/prod/pages/qrcode).

Make changes, push to GitHub, and your app automatically redeploys each time. Like Railway, you can deploy to any hosting provider of your choice.

Check out the Railway documentation for more advanced settings, like adding [variables](https://docs.railway.app/guides/variables) to your app.
