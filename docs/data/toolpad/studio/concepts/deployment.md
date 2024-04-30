# Deployment

<p class="description">Deploying a Toolpad Studio app is like deploying any other React/Node application.</p>

## Pre-requisites

- This guide assumes that you have copied your project folder to the server, and all subsequent commands are run inside it.

- Make sure to add the following scripts to your `package.json`

```json
 "scripts": {
   "dev": "toolpad-studio dev"
   "build": "toolpad-studio build"
   "start": "toolpad-studio start"
 }
```

## Install step

Install required depdencies via:

<codeblock storageKey="package-manager">

```bash npm
npm install
```

```bash yarn
yarn
```

</codeblock>

## Build step

This command will create an optimized production build for the Toolpad Studio app and will output the generated files:

<codeblock storageKey="package-manager">

```bash npm
npm run build
```

```bash yarn
yarn build
```

```bash pnpm
pnpm build
```

</codeblock>

## Start step

Once the build has been made, you can deploy it to any service of your choice!

To serve the app once built, run:

<codeblock storageKey="package-manager">

```bash npm
npm run start
```

```bash yarn
yarn start
```

</codeblock>

If you want to listen on a specific port you can change the start script to:

```json
  "start": "toolpad-studio start -p 1234"
```

## Custom base path

Toolpad Studio applications can run under a custom base path. Use the `--base` CLI parameter to set a base under which the Toolpad Studio application is hosted.

```bash
toolpad-studio dev --base /foo
```

Now the Toolpad Studio application is accessible under `http://localhost:3000/foo`. The `--base` parameter must be supplied to the `build` command. A build always has one specific base path:

```bash
toolpad-studio build --base /foo
toolpad-studio start --base /foo
```

## Detailed guides

Detailed, step-by-step instructions are available for the following services:

- [Render](/toolpad/studio/how-to-guides/render-deploy/)
