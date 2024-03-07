---
title: Overview
---

# Toolpad - Overview

<p class="description">Learn the fundamentals of building with Toolpad Core by creating a small application.</p>

## Installation

Run

<codeblock storageKey="package-manager">

```bash pnpm
pnpm dlx create-toolpad-app --core
```

```bash yarn
yarn create toolpad-app --core
```

</codeblock>

Follow the instructions of the CLI. After you conclude the installation process, change your working dir to the project and run
<codeblock storageKey="package-manager">

```bash pnpm
pnpm run dev
```

```bash yarn
yarn dev
```

</codeblock>

Visit **http://localhost:3000/** in your browser to open the application

## Options of the CLI

- Do you want to enable authentication?
  - select authentication method
  - follow instructions at XYZ and paste the auth token (written to .env)
- Do you want to enable RBAC
- …?

The CLI scaffolds a Next.js project with all Toolpad features set up

## Tutorial

1. Run
   `bash
    yarn create toolpad-app --tutorial my-first-project
`

   This will prompt for a project name and create a basic project for this tutorial

2. Install the packages necessary for this example

   ```bash
   yarn add -S @mui/x-data-grid @mui/x-charts @mui/toolpad-data-csv
   ```

3. Run

   ```bash
   cd my-first-project
   yarn dev
   ```

   to start the app in dev mode

4. Create a file `/app/hello-world/page.tsx` and add

   ```tsx
   import * as React from 'react';

   export default async function HelloWorld() {
     return <div>Hello world!</div>;
   }
   ```

In your browser open the page http://localhost:3000/hello-world and verify that it shows "Hello World!"

5. Now to add our first data provider. Copy the sample CSV file (insert link) to the project root and add the following

   ```tsx
   import * as React from 'react';
   import createDataProviderCsv from '@mui/toolpad-data-csv';
   import DataGrid from '@mui/x-data-grid';
   import { useDataGrid } from '@mui/toolpad';

   const myCsvData = createDataProviderCsv('./sample-data.csv');

   export default async function HelloWorld() {
     const dataGridProps = useDataGrid(myCsvData);

     return (
       <div>
         <DataGrid {...dataGridProps} />
       </div>
     );
   }
   ```

   <aside>
   ❕ Add live demo here of the above
   Break down each line that was added and explain what it does.
   </aside>

6. This is great, but we'd also like to visualise this data:

   ```tsx
   import * as React from 'react';
   import createDataProviderCsv from '@mui/toolpad-data-csv';
   import DataGrid from '@mui/x-data-grid';
   import { BarChart } from '@mui/x-charts';
   import { useDataGrid, useChart } from '@mui/toolpad';

   const myCsvData = createDataProviderCsv('./sample-data.csv');

   export default async function HelloWorld() {
     const dataGridProps = useDataGrid(myCsvData);
     const chartProps = useChart(myCsvData, {
       xAxis: 'categories',
       yAxis: ['values'],
     });

     return (
       <div>
         <DataGrid {...dataGridProps} />
         <BarChart {...chartProps} />
       </div>
     );
   }
   ```

   <aside>
   ❕ Add live demo here of the above
   Break down each line that was added and explain what it does.

   </aside>

   Now both the data grid and the chart display the CSV data

7. Wouldn't it be nice if the chart also displayed the data in the grid as it was filtered?

   ```tsx
   import * as React from 'react';
   import createDataProviderCsv from '@mui/toolpad-data-csv';
   import DataGrid, { GridFilterModel } from '@mui/x-data-grid';
   import { BarChart } from '@mui/x-charts';
   import { useDataGrid, useChart, useSharedDataProvider } from '@mui/toolpad';

   const myCsvData = createDataProviderCsv('./sample-data.csv');

   export default async function HelloWorld() {
     const [filterModel, setFilterModel] = React.useState<GridFilterModel>({});

     const mySharedProvider = useSharedDataProvider(myCsvData, {
       filterModel,
       setFilterModel,
     });

     const dataGridProps = useDataGrid(mySharedProvider);
     const chartProps = useChart(mySharedProvider, {
       xAxis: 'categories',
       yAxis: ['values'],
     });

     return (
       <div>
         <DataGrid
           {...dataGridProps}
           filterModel={filterModel}
           onFilterModelChange={setFilterModel}
         />
         <BarChart {...chartProps} />
       </div>
     );
   }
   ```

   <aside>
   ❕ Add live demo here of the above
   Break down each line that was added and explain what it does.

   </aside>

   This concludes the tutorial.
