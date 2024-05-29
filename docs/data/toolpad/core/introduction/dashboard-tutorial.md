---
---

# Dashboard tutorial

<p class="description">Tutorial</p>

## Connecting data

Toolpad Core comes with the concept of data providers. At its core, a data provider abstracts a remote collection. A data provider implements a `getMany` method and defines some fields:

```js
import { createDataProvider } from '@toolpad/core/DataProvider';

const npmData = createDataProvider({
  async getMany() {
    const res = await fetch('https://api.npmjs.org/downloads/range/last-year/react');
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }
    const { downloads } = await res.json();
    return { rows: downloads.map((point: any) => ({ ...point, id: point.day })) };
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
import { Box } from '@mui/material';

// ...

export default function App() {
  return (
    <Box sx={{ height: 300, width: '100%' }}>
      <DataGrid dataProvider={npmData} />
    </Box>
  );
}
```

This results in the following output

{{"demo": "Tutorial1.js", "hideToolbar": true}}
