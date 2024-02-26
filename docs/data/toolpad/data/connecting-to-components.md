# Connecting to components

<p class="description">Connecting data fetched from providers to components is seamless</p>

## Hooks

Hooks that take a data provider and return props for data components. These hold state so they can only be use in client components. Therefore we would need to work with 2 files. One `'use server'` where the data providers are created and one `'use client'` where the hooks connect them to client components.

```tsx
// ./app/my-dashboard/page.tsx
import ClientDashboard from './client.tsx';
import { createDataProvider } from '@mui/toolpad';

export default async function MyDashboard() {
  // load data server side
  const myData = await fs.readFile('./my-data');
  // aggregate data serverside
  const myAggData = Object.entries(
    Object.groupBy(myData, (item) => item.category),
  ).map(([category, item]) => ({
    category,
    count: item.length,
    avg: item.reduce((acc, item) => acc + item.price, 0) / item.length,
  }));

  return <ClientDashboard myData={myData} myAggData={myAggData} />;
}
```

-

```tsx
// ./app/my-dashboard/page.tsx
'use client';

import {
  DataProvider,
  useDataGrid,
  useChart,
  Codecs,
  createQueryParam,
} from '@mui/toolpad';
import { Box } from '@mui/material';
import { Chart, LinePlot } from '@mui/x-charts';
import { DataGrid } from '@mui/x-data-grid';

export interface DashboardProps {
  myData: any[];
  myAggData: any[];
}

const today = dayjs().startOf('day');

const rangeMin = createQueryParam(
  'rangeMin',
  today.subtract(1, 'month'),
  Codecs.DayJs,
);

const rangeMax = createQueryParam('rangeMax', today, Codecs.DayJs);

export default function Dashboard(props: DashboardProps) {
  const myDataProvider = createStaticProvider(props.myData);
  const myAggDataProvider = createStaticProvider(props.myAggData);

  const rangeMin = rangeMin.useValue();
  const rangeMax = rangeMax.useValue();

  const handleRangeChange = React.useCallback((range) => {
    rangeMin.set(range[0]);
    rangeMax.set(range[1]);
  });

  const filter = React.useMemo(() => {
    items: [
      { field: 'date', operator: 'gt', value: rangeMin },
      { field: 'date', operator: 'lt', value: rangeMax },
    ];
  }, [rangeMin, rangeMax]);

  const grid = useDataGrid(myDataProvider, { filter });
  const chart = useChart(myAggDataProvider, { filter });

  // Dashboard provides context for hover state syncing
  return (
    <Dashboard>
      <DateRangePicker value={[rangeMin, rangeMax]} onChange={handleRangeChange} />
      <DataGrid {...grid.getProps()} />
      <Chart {...chart.getProps()}>
        <LinePlot />
      </Chart>
    </Dashboard>
  );
}
```

Advantages:
