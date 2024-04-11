---
title: Toolpad Core - Tutorial
---

# Toolpad Core - Tutorial

<p class="description">Learn the fundamentals of building with Toolpad Core by creating a small application.</p>

1. Use the following command to launch a basic project for this tutorial:

   ```bash yarn
   yarn create toolpad-app --core
   ```

2. Install the packages necessary for this example

   ```bash
   yarn add -S @mui/x-data-grid @mui/x-charts @mui/toolpad-data-csv
   ```

3. Run the following command to start the app in dev mode:

   ```bash
   cd my-first-project
   yarn dev
   ```

4. Add the following to `/app/hello-world/page.tsx`:

   ```tsx
   import * as React from 'react';

   export default async function HelloWorld() {
     return <div>Hello world!</div>;
   }
   ```

5. Open [http://localhost:3000/hello-world](http://localhost:3000/hello-world) in your browser and verify that it shows "Hello World!"

6. Now to add our first data provider. Copy the sample CSV file (insert link) to the project root and add the following

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

7. This is great, but we'd also like to visualise this data:

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

8. Wouldn't it be nice if the chart also displayed the data in the grid as it was filtered?

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
