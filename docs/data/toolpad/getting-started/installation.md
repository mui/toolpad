# Installation

<p class="description">Setup Toolpad to run on your own machine.</p>

## Create a Toolpad app

Start by opening a terminal and `cd` into a folder you'd like to create your applicarion in.
Then run the command:

<codeblock storageKey="package-manager">

```bash npm
npx create-toolpad-app@latest
```

```bash yarn
yarn create toolpad-app
```

```bash pnpm
pnpm create toolpad-app
```

</codeblock>

:::info
This will run the `create-toolpad-app` CLI which asks for the folder in which you wish to initialise your Toolpad application.
By default, it will use `./my-toolpad-app`.
:::

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
