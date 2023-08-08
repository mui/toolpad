# Deployment

<p class="description">Deploying a Toolpad app is like deploying any other React/Node application.</p>

## Pre-requisites

- This guide assumes that you have copied your project folder to the server, and all subsequent commands are run inside it.

- Make sure to add the following scripts to your `package.json`

```json
 "scripts": {
   "dev": "toolpad dev"
   "build": "toolpad build"
   "start": "toolpad start"
 }
```

## Install step

Install needed depdencies via:

<codeblock storageKey="toolpad-deploy-package-manager">

```bash npm
npm install
```

```bash yarn
yarn
```

</codeblock>

## Build step

This command will create an optimized production build for the Toolpad app and will output the generated files:

<codeblock storageKey="toolpad-deploy-package-manager">

```bash npm
npm run build
```

```bash yarn
yarn build
```

</codeblock>

## Start step

Once the build has been made, you can deploy it to any service of your choice!

To serve the app once built, run:

<codeblock storageKey="toolpad-deploy-package-manager">

```bash npm
npm run start
```

```bash yarn
yarn start
```

</codeblock>

If you want to listen on a specific port you can change the start script to:

```json
  "start": "toolpad start -p 1234"
```

## Detailed guides

Detailed, step-by-step instructions are available for the following services:

- [Render](/toolpad/how-to-guides/render-deploy/)
