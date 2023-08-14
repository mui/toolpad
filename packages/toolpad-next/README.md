# @mui/toolpad-next

POC for the live configurators direction

1. Set up project

   ```bash
   curl https://codeload.github.com/mui/material-ui/tar.gz/master | tar -xz --strip=2 material-ui-master/examples/material-vite-ts
   cd material-vite-ts
   yarn
   ```

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

1. Create component

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

1. Start project

   ```bash
   yarn dev
   ```

1. Open browser. See live grid with edit button
