# mui-toolpad-examples

## To get started on the bundle size application

```sh
cd ./bundleSize
yarn
yarn dev
```

## To start building an application

### setup

```sh
mkdir my-app
cd ./my-app
yarn init --yes
yarn add @mui/toolpad @mui/toolpad-core
```

add the following scripts to package.json:

```json
"scripts": {
  "dev": "toolpad dev",
  "build": "toolpad build",
  "start": "toolpad start"
}
```

(TODO: replace above with a `npx @mui/toolpad init`?)

run

```sh
yarn dev
```

Go to the url that's printed

### app building

You'll see the trusted page editor. connections/components have been removed.

#### Creating a custom component

Go to the component drawer and click on "create new component".
In your toolpad/components folder a new component will appear. you can edit in vscode.

Known sharp edges:

- close the toolpad component editor because it makes it interfere with the file system one.
- do not rename the file, or at least not to something that doesn't start with a small letter, or contains spaces ot special characters. You'll see strange things happen. To be fixed
- the code will be copied verbatim in the toolpad config. This is because that's currently exactly how this works. It's a hack and we'll come up with something proper once we are able to change low level things in Toolpad

#### Connecting data

You'll see you can only create two types of queries for now. Local function queries are defined inside of the `./toolpad/queries.ts` file. If you create a local function query, you'll see an editor where you can select one of the exported functions in `./toolpad/queries.ts` and bind parameters. there's a button that will open vscode for you to edit the queries file. In this file you can export any async function and it will appear in the query editor dropdown, click preview to run it and see its result. You can use environment variables here and import node modules. The result of the function will be brought to the page as bindable state.
