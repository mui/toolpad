# Live Configurators

<p class="description">Update your datagrid configuration straight in your application</p>

## Live configurators

### Live editable components in your application

Import our generated components and edit them in our browser devtool. Get immediate feedback and avoid reading documentation altogether.

### Generates production ready code

Don't compromise on performance, our generators produce the same optimized code that you would have hand-written.

### Eject any time you want

You can eject any time you like and get readable code for your component. Use it as your starting point for more complex use-cases.

## Demo

Click the edit button to open the live configurator. Hit save when you're done and see the page update.

{{"demo": "BasicExampleGrid.js"}}

## installation

To try this out in your own project

1. Add dependencies

   ```bash
   yarn add @mui/x-data-grid https://pkg.csb.dev/mui/mui-toolpad/commit/817b15a5/@mui/toolpad-next
   ```

1. Add scripts in `package.json`

   ```json
     "scripts": {
       "toolpad-next": "toolpad-next"
     }
   ```

1. Create a component

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
