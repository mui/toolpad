# Deploy to Railway

<p class="description">You can host and share your Toolpad Studio apps on Railway in a few minutes, for free.</p>

This guide walks you through the deployment of a Toolpad Studio app from a GitHub repository.

## Prerequisites

- A [Railway](https://railway.app/) account
- A [GitHub](https://github.com) account
- A GitHub repository containing your Toolpad Studio app. Check out [pushing your Toolpad Studio app to GitHub](/toolpad/studio/how-to-guides/render-deploy/#pushing-your-toolpad-studio-app-to-github) for this step.

## Creating a new app on Railway

1. From your Railway dashboard, click on **New Project** from the top-right corner and choose **Deploy from GitHub repo** from the drop-down.

{{"component": "modules/components/DocsImage.tsx", "src": "/static/toolpad/docs/studio/how-to-guides/deploy-railway/railway-create-new-project.png", "alt": "Railway new project", "caption": "Creating a new Railway project", "indent": 1 }}

2. Depending on whether the visibility of the repository is set to private or public, you may need to connect your GitHub account to Railway using **Configure GitHub App**. Once done, you'll see a list of repositories to choose from.

{{"component": "modules/components/DocsImage.tsx", "src": "/static/toolpad/docs/studio/how-to-guides/deploy-railway/choose-repository.png", "alt": "Choosing the repository", "caption": "Choosing the repository", "indent": 1 }}

3. Select the repository and click on **Add Variables**. Any environment variables that your app needs can be set up now.

{{"component": "modules/components/DocsImage.tsx", "src": "/static/toolpad/docs/studio/how-to-guides/deploy-railway/add-variable.png", "alt": "Adding variable", "caption": "Adding a variable","indent": 1 }}

4. Toolpad Studio apps run on port 3000, so add a `PORT` variable and set its value to 3000.

{{"component": "modules/components/DocsImage.tsx", "src": "/static/toolpad/docs/studio/how-to-guides/deploy-railway/add-port-as-a-variable.png", "alt": "Adding port as a variable", "caption": "Adding PORT as a variable", "indent": 1 }}

5. On the same UI, go to the Settings tab, scroll down and and click on **Generate Domain** to create a public URL. You can also create a custom URL.

{{"component": "modules/components/DocsImage.tsx", "src": "/static/toolpad/docs/studio/how-to-guides/deploy-railway/generate-domain.png", "alt": "Generating a public URL", "caption": "Generating a public URL", "indent": 1 }}

6. If you scroll below, you'll see that the build and start commands are set to

   ```bash
   $ npm run build
   $ npm run start
   ```

   by default. You can leave this unchanged.

7. A floating **Deploy** button appears on the canvas.. Click it and the build starts.

{{"component": "modules/components/DocsImage.tsx", "src": "/static/toolpad/docs/studio/how-to-guides/deploy-railway/deploy.png", "alt": "Deploy app", "caption": "Deploy app", "indent": 1 }}

8. Once this is successfully complete, you can access your Toolpad Studio app from the public URL available on the card.

That's it! The app is up and running. Make changes, push to GitHub, and your app automatically redeploys each time. You may deploy to any other hosting provider of your choice as well.

Check out the Railway documentation for more advanced settings, like adding [variables](https://docs.railway.app/guides/variables) to your app.

### Common Pitfalls

1. Sometimes the build may fail as your app could be in a different directory. To configure the right path, navigate to the **Settings** tab and update the root directory.

{{"component": "modules/components/DocsImage.tsx", "src": "/static/toolpad/docs/studio/how-to-guides/deploy-railway/setting-root-directory.png", "alt": "Updating the root directory", "caption": "Updating the root directory", "indent": 1 }}
