# Deploy to GCP

<p class="description">You can host and share your Toolpad Studio apps on Google Cloud Platform (GCP) in a few minutes, for free.</p>

GCP offers an ecosystem of products to help you build, manage, and scale any web service. This guide uses [Cloud Run](https://cloud.google.com/run) and [Cloud Build](https://cloud.google.com/build) to deploy a Toolpad Studio app from a GitHub repository.

## Prerequisites

- A [GCP](https://console.cloud.google.com/) account
- A [GitHub](https://github.com) account
- A GitHub repository containing your Toolpad Studio app. Check out [pushing your Toolpad Studio app to GitHub](/toolpad/studio/how-to-guides/render-deploy/#pushing-your-toolpad-studio-app-to-github) for this step.

## Setting a new app on GCP

1. Login in to Google Cloud console and from the header bar choose the project where you want to setup the web service.

{{"component": "modules/components/DocsImage.tsx", "src": "/static/toolpad/docs/studio/how-to-guides/deploy-gcp/choose-project.png", "alt": "Choose project", "caption": "Choosing the project to setup the web service", "indent": 1 }}

2. From the navigation menu icon, click on **Cloud Run**.

{{"component": "modules/components/DocsImage.tsx", "src": "/static/toolpad/docs/studio/how-to-guides/deploy-gcp/navigate-to-cloud-run.png", "alt": "Navigate to cloud run", "caption": "Navigate to cloud run", "indent": 1}}

3. Click on **Create Service** to set up your web app.

{{"component": "modules/components/DocsImage.tsx", "src": "/static/toolpad/docs/studio/how-to-guides/deploy-gcp/create-service.png", "alt": "Create Cloud Run service", "caption": "Create Cloud Run service", "indent": 1}}

4. In the Create service UI, choose **Continuously deploy from a repository** and give a name to your service from the **Service name** input. Further click on **Setup with cloud build** button.

{{"component": "modules/components/DocsImage.tsx", "src": "/static/toolpad/docs/studio/how-to-guides/deploy-gcp/setup-run-service.png", "alt": "Configuring Cloud Run service", "caption": "Configuring Cloud Run service", "indent": 1 }}

5. This opens a drawer menu. From the drop-down, choose the repository that contains your Toolpad Studio app and click Next.

{{"component": "modules/components/DocsImage.tsx", "src": "/static/toolpad/docs/studio/how-to-guides/deploy-gcp/choose-repository.png", "alt": "Choose repository", "caption": "Choose respository", "indent": 1 }}

6. The branch input shows `main` by default and it can remain unchanged. From the radio buttons, choose the second option as it is a Node.js app. The other configurations can be kept unchanged. Click **Save**.

{{"component": "modules/components/DocsImage.tsx", "src": "/static/toolpad/docs/studio/how-to-guides/deploy-gcp/build-type.png", "alt": "Choosing branch and build type", "caption": "Choosing branch and build type", "indent": 1 }}

7. With the drawer closed, on the Cloud Run setup UI, choose **Allow unauntheticated invocations** to create a public app that needs no authentication and scroll down.

{{"component": "modules/components/DocsImage.tsx", "src": "/static/toolpad/docs/studio/how-to-guides/deploy-gcp/back-to-cloud-run.png", "alt": "Select allow unauntheticated invocations", "caption": "Select allow unauntheticated invocations", "indent": 1}}

8. The last step is to expand the 'Container(s), Volumes, Networking, Security' caret. The first input **Container port** needs to be updated to 3000. Click the **Create** button to start the service.

{{"component": "modules/components/DocsImage.tsx", "src": "/static/toolpad/docs/studio/how-to-guides/deploy-gcp/set-container-port.png", "alt": "Set contianer port", "caption": "Set contianer port", "indent": 1}}

9. The next screen shows that the deployment is in progress and the build is being prepared, which can take 3-5 minutes. You can click on the **logs** link (pending state) to see the live build logs in Cloud Build UI.

{{"component": "modules/components/DocsImage.tsx", "src": "/static/toolpad/docs/studio/how-to-guides/deploy-gcp/deployment.png", "alt": "Deployment in progress", "caption": "Deployment in progress", "indent": 1}}

{{"component": "modules/components/DocsImage.tsx", "src": "/static/toolpad/docs/studio/how-to-guides/deploy-gcp/build-logs.png", "alt": "Build logs", "caption": "Build logs", "indent": 1}}

10. Once this is successfully complete, go back to the Cloud Run page and access your Toolpad Studio app from the created URL .

{{"component": "modules/components/DocsImage.tsx", "src": "/static/toolpad/docs/studio/how-to-guides/deploy-gcp/build-complete.png", "alt": "GCP deployment complete", "caption": "Deployed successfully", "indent": 1 }}

That's it! The app is up and running in a few minutes. Make changes, push to GitHub, and your app automatically redeploys each time.

## Common pitfalls

1. GCP chooses npm as the default package manager, you might have to change. Check out [Building a Node.js application](https://cloud.google.com/docs/buildpacks/nodejs) for more.

2. You might have to enable account permissions and APIs within the Google Cloud console. These are the security measures that GCP puts in place. For instance, this deployment required enabling a few GCP services from the Cloud Build Settings UI.

{{"component": "modules/components/DocsImage.tsx", "src": "/static/toolpad/docs/studio/how-to-guides/deploy-gcp/pitfall.png", "alt": "Enable GCP service", "caption": "Enable GCP service", "indent": 1 }}

3. You may have to update your root directory in the Build context directory input in step 6.

In case you need more information, you can check [Deploy a Node.js service to Cloud Run](https://cloud.google.com/run/docs/quickstarts/build-and-deploy/deploy-nodejs-service) quickstart guide from Google.
