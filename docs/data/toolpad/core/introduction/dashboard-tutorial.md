---
---

# Dashboard tutorial

<p class="description">Tutorial</p>

## Connecting data

Toolpad core comes with the concept of data providers. At its core, a data provider abstracts a remote collection. A data provider implements a `getMany` method and defines some fields:

```js
import { createDataProvider } from '@toolpad/core/DataProvider';

const npmData = createDataProvider({
  async getMany() {
    const res = await fetch(
      'https://api.npmjs.org/downloads/range/last-year/react',
    );
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    const { downloads } = await res.json();
    return { rows: downloads.map((point: any) => ({ ...point, id: point.day })) };
  },
  fields: {
    id: {},
    day: { type: 'date' },
    downloads: { type: 'number' },
  },
});
```

You can then visualize this data by connecting it to a grid:

```js
import { DataGrid } from '@toolpad/core';
import { Box } from '@mui/material';

// ...

export default function App() {
  return (
    <Box sx={{ height: 300 }}>
      <DataGrid dataProvider={npmData} />
    </Box>
  );
}
```

This results in the following output

{{"demo": "Tutorial1.js", "hideToolbar": true}}

## Sharing a datasource

The data providers can be shared between different data components. For example, to also visualize this data in a chart you can add the BarChart component and connect the same data:

```js
import { DataGrid, LineChart } from '@toolpad/core';

// ...

export default function App() {
  return (
    <div>
      <Box sx={{ height: 300 }}>
        <DataGrid dataProvider={npmData} />
      </Box>
      <LineChart
        height={300}
        dataProvider={npmData}
        xAxis={[{ dataKey: 'day' }]}
        series={[{ dataKey: 'downloads' }]}
      />
    </div>
  );
}
```

This results in the following Dashboard

{{"demo": "Tutorial2.js", "hideToolbar": true}}

## Filtering

```js
import { DataContext } from '@toolpad/core';

export default function App() {
  const [maxRuntime, setMaxRuntime] = React.useState(200);
  return (
    <div>
      <Toolbar>
        <TextField
          label="Maximum Runtime"
          value={maxRuntime}
          onChange={(event) => setMaxRuntime(event.target.value)}
        />
      </Toolbar>
      <DataContext filter={{ runtime: { lt: maxRuntime } }}>{/* ... */}</DataContext>
    </div>
  );
}
```
