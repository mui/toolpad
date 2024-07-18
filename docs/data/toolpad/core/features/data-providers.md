# Data Providers

<p class="description">Connect with multiple data providers fast - no boilerplate or lengthy integration efforts </p>

## Interface

A data provider is a stateless interface representing a collection of remote data. It mainly contains methods to fetch and manipulate this data, along with certain additional methods for certain data providers.

```tsx
import { createDataProvider } from '@toolpad/data';

const dataProvider = createDataProvider({
  async getRecords({}) {
    return fetch('/...');
  },
});
```

## Connecting to components

To connect to components, the stateless data provider can be made stateful using a headless API.

```tsx
const gridProps = useDataGrid(dataProvider, {
  // options
});

const chartProps = useChart(dataProvider, {
  // options
});

const sharedDataSource = useSharedDataProvider(dataProvider, {
  // options
});
```

## Server-side data providers

```tsx
// ./pages/api/myDataProvider.ts
import { serverDataProvider } from '@toopad/core';
import db from '../postgres';

export default servedataProvider({
  async getRecords({}) {
    return db.getRows();
  },
});
```

Then connect to it from the client with

```tsx
import { createRestProvider } from '@toopad/core';

const dataProvider = createRestProvider('/api/myDataProvider');
```
