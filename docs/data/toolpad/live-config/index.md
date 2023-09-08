# Live Configurators

<p class="description">Update your datagrid configuration straight in your application</p>

## Live configurators

The live configurators concept enhances the MUI X components workflow. It renders a playground for your data components right inside your application. Any change you make will immediately be persisted in your project. Toolpad produces performant and production ready code as if you write it by hand.

- **Live editable components in your application**

  Import our generated components and edit them in our browser devtool. Get immediate feedback and see your changes automatically saved in your project folder.

- **Eject any time you want**

  There is no lock-in, you can eject at any time you like. Toolpad will produce readable code for your component. Use it as your starting point for more complex use-cases.

- **Generates production ready code**

  Don't compromise on performance, our generators produce the same optimized code that you would have hand-written. If the result satisfies your use-case

## Demo

Click the edit button to open the live configurator. Hit save when you're done and see the page update.

{{ "demo": "BasicExampleGrid.js", "hideToolbar": true }}

## installation

To try this out in your project, follow these steps:

1. Add the required dependencies

   ```bash
   yarn add @mui/x-data-grid https://pkg.csb.dev/mui/mui-toolpad/commit/bbc149b8/@mui/toolpad-next
   ```

1. Add the following scripts in your `package.json`

   ```json
     "scripts": {
       "toolpad-next": "toolpad-next"
     }
   ```

1. Create a new `toolpad-next` component

   ```bash
   mkdir -p ./toolpad
   echo "kind: 'DataGrid'" > ./toolpad/MyGrid.yml
   ```

1. Start live configurators

   ```bash
   yarn toolpad-next dev
   ```

1. Import component in `./src/App.tsx`:

   ```tsx
   import MyGrid from '../toolpad/.generated/MyGrid';

   // ...
           <Typography variant="h4" component="h1" gutterBottom>
             Material UI Vite.js example in TypeScript
           </Typography>

           <MyGrid />

           <ProTip />
           <Copyright />
   // ...
   ```

## Roadmap

- DataGrid
  - Support more backends
    - GraphQL
    - OpenAPI
  - SUpport for serverside pagination/filtering/sorting
  - Support caching
    - SWC
    - react-query
  - Support column configurations
  - Support pro/premium
  - ...
- Charts
- Shared data sources
- Drag&Drop?
