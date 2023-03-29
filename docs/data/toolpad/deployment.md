# Deployment

<p class="description">Deploying a Toolpad app is a 3-step process and quite like any other react application.</p>

To serve your app locally:

```sh
npm start
```

This command will create an optimized production build for the Toolpad app and will output what files it has generated and how large each file is:

```sh
npm run build
```

Once the build has been made. You can deploy it to any service of your choice!

## Standalone display mode

By default, Toolpad apps include built-in page navigation in a sidebar on the left of screen.

<!--- Include optional image highlighting built-in navigation sidebar -->

You can hide the built-in navigation by adding `toolpad-display=standalone` as a query parameter to the URL.
