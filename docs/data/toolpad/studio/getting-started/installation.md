# Installation

<p class="description">Setup Toolpad Studio to run on your own machine.</p>

## Create a Toolpad Studio app

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

This will run the `create-toolpad-app` CLI which initializes the directory `./my-toolpad-app` with a Toolpad Studio application.

## Run the Toolpad Studio editor

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
pnpm dev
```

</codeblock>

This starts the development server on port `3000` or the first available port after that and opens the browser to the Toolpad Studio editor.

## Install Toolpad Studio in an existing project

Start by installing the required dependencies:

<codeblock storageKey="package-manager">

```bash npm
npm install -S @toolpad/studio
```

```bash yarn
yarn add @toolpad/studio
```

```bash pnpm
pnpm add @toolpad/studio
```

</codeblock>

Then you'll have to add the Toolpad Studio scripts to your `package.json`:

```json
// ./package.json
...
  "scripts": {
    "toolpad-studio:dev": "toolpad-studio dev ./my-toolpad-app",
    "toolpad-studio:build": "toolpad-studio build ./my-toolpad-app",
    "toolpad-studio:start": "toolpad-studio start ./my-toolpad-app"
  }
...
```

Now you can start your Toolpad Studio application using one of the commands:

<codeblock storageKey="package-manager">

```bash npm
npm run toolpad-studio:dev
```

```bash yarn
yarn toolpad-studio:dev
```

```bash pnpm
pnpm toolpad-studio:dev
```

</codeblock>

When you run this command, Toolpad Studio will automatically initialize a new application in the **./my-toolpad-app** folder.

:::info
To integrate a Toolpad Studio application in an existing server, you can follow the custom server [integration guide](/toolpad/studio/concepts/custom-server/).
:::
