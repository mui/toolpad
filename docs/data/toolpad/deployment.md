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

## Overriding page display mode

You can override any page's display mode by adding the `toolpad-display` query parameter to the URL.

Possible values:

- `standalone` - Hide app shell
- `shell` - Show navigation UI sidebar
