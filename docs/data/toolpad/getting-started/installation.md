# Installation

<p class="description">Setup Toolpad to run on your own machine.</p>

## Create a Toolpad app

Start by opening a terminal and `cd` into a folder you'd like to create your application in.
Then run the command:

<codeblock storageKey="package-manager">

```bash npm
npx create-toolpad-app@latest my-toolpad-app
```

```bash yarn
yarn create toolpad-app my-toolpad-app
```

```bash pnpm
pnpm create toolpad-app my-toolpad-app
```

</codeblock>

This will run the `create-toolpad-app` CLI which initializes the directory `./my-toolpad-app` with a Toolpad application.

## Run the Toolpad editor

Change the current working directory to the application folder:

```bash
cd my-toolpad-app
```

Then start the development mode

<codeblock storageKey="package-manager">

```bash npm
npm run dev
```

```bash yarn
yarn dev
```

```bash pnpm
pnpm run dev
```

</codeblock>

This starts the development server on port `3000` or the first available port after that and opens the browser to the Toolpad editor.

## Install Toolpad in an existing project

Start by installing the required dependencies:

<codeblock storageKey="package-manager">

```bash npm
pnpm install -S @mui/toolpad
```

```bash yarn
yarn add @mui/toolpad
```

```bash pnpm
pnpm add @mui/toolpad
```

</codeblock>

Then you'll have to add the toolpad scripts to yur `package.json`:

```json
// ./package.json
...
  "scripts": {
    "toolpad:dev": "toolpad dev ./my-toolpad-app",
    "toolpad:build": "toolpad build ./my-toolpad-app",
    "toolpad:start": "toolpad start ./my-toolpad-app"
  }
...
```

Now you can start your toolpad application using one of the commands:

<codeblock storageKey="package-manager">

```bash npm
npm run toolpad:dev
```

```bash yarn
yarn toolpad:dev
```

```bash pnpm
pnpm run toolpad:dev
```

</codeblock>

When you run this command, Toolpad will automatically initialize a new application in the **./my-toolpad-app** folder.

:::info
To integrate a Toolpad application in an existing server, you can follow the custom server [integration guide](/toolpad/concepts/custom-server/).
:::
