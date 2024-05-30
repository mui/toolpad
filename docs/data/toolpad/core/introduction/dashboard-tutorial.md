# Dashboard tutorial

<p class="description">Tutorial</p>

## Connecting data

Toolpad Core comes with the concept of data providers. At its core, a data provider abstracts a remote collection. A data provider implements a `getMany` method and defines some fields:

```js
import { createDataProvider } from '@toolpad/core/DataProvider';

const npmData = createDataProvider({
  async getMany({ filter }) {
    const res = await fetch(
      `https://api.npmjs.org/downloads/range/${encodeURIComponent(filter.range?.equals ?? 'last-month')}/react`,
    );
    if (!res.ok) {
      const { error } = await res.json();
      throw new Error(`HTTP ${res.status}: ${error}`);
    }
    const { downloads } = await res.json();
    return { rows: downloads };
  },
  idField: 'day',
  fields: {
    day: { type: 'date' },
    downloads: { type: 'number' },
  },
});
```

You can then visualize this data by connecting it to a grid:

```js
import { DataGrid } from '@toolpad/core';
import { Stack } from '@mui/material';

// ...

export default function App() {
  return (
    <Stack sx={{ width: '100%' }} spacing={2}>
      <DataGrid height={300} dataProvider={npmData} />
    </Stack>
  );
}
```

This results in the following output

{{"demo": "Tutorial1.js", "hideToolbar": true}}

## Sharing data providers

Interesting things happen when you share data providers between different components. For instance, you can add a chart that uses the same data.

```js
// ...
import { DataGrid, LineChart } from '@toolpad/core';

// ...

export default function App() {
  return (
    <Stack sx={{ width: '100%' }} spacing={2}>
      <DataGrid height={300} dataProvider={npmData} />
      <LineChart
        height={300}
        dataProvider={npmData}
        xAxis={[{ dataKey: 'day' }]}
        series={[{ dataKey: 'downloads' }]}
      />
    </Stack>
  );
}
```

The Toolpad Core components automatically adopt default values

{{"demo": "Tutorial2.js", "hideToolbar": true}}

## Global Filtering

{{"demo": "Tutorial3.js", "hideToolbar": true}}
