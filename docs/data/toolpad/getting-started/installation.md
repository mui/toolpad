# Installation

<p class="description">Setup Toolpad to run on your own machine.</p>

## Create a Toolpad app

Start by opening a terminal and `cd` into a folder you'd like to create your applicarion in. Then run the command

```sh
npx create-toolpad-app my-app
```

> This will run the `create-toolpad-app` CLI which initializes the directory `./my-app` with a Toolpad application.

## Run the Toolpad editor

Change the current working directory to the application folder:

```sh
cd my-app
```

Then start the development mode

```sh
npm run dev
```

This starts the development server on port `3000` or the first available port after that and opens the browser to the Toolpad editor.
