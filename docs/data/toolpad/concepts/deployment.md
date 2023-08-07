# Deployment

<p class="description">Deploying a Toolpad app is like deploying any other React/Node application.</p>

## Pre-requisites

Make sure to add the following scripts to your `package.json`

```json
 "scripts": {
   "dev": "toolpad dev"
   "build": "toolpad build"
   "start": "toolpad start"
 }
```

## Build steps

This command will create an optimized production build for the Toolpad app and will output the generated files:

```bash
yarn build
```

Once the build has been made, you can deploy it to any service of your choice!

To serve the app once built, run:

```bash
yarn start
```

If you want to listen on a specific port you can change the start script to:

```json
  "start": "toolpad start -p 1234"
```

:::info
  Detailed, step-by-step instructions are available for the following services:
  - [Render](/toolpad/how-to-guides/render-deploy/)
:::
