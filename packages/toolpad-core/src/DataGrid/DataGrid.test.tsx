/**
 * @vitest-environment jsdom
 */

import * as React from 'react';
import { describe, test, expect, afterEach } from 'vitest';
import { render, cleanup, waitFor } from '@testing-library/react';
import { DataGrid as XDataGrid } from '@mui/x-data-grid';
import describeConformance from '@toolpad/utils/describeConformance';
import { DataGrid } from './DataGrid';
import { createDataProvider } from '../DataProvider';

describe('DataGrid', () => {
  afterEach(cleanup);

  describeConformance(<DataGrid />, () => ({
    inheritComponent: XDataGrid,
    skip: ['themeDefaultProps'],
  }));

  test.only('renders content correctly', async () => {
    const rows = [
      { id: 1, name: 'Alice' },
      { id: 2, name: 'Bob' },
    ];
    const dataProvider = createDataProvider({
      getMany: async () => {
        return { rows };
      },
      fields: {
        id: { type: 'number' },
        name: { type: 'string' },
      },
    });

    const { getByText } = render(<DataGrid height={300} dataProvider={dataProvider} />);

    await waitFor(() => expect(getByText('Alice')).toBeTruthy());
  });

  test('renders content correctlyd', async () => {
    const rows = [
      { id: 1, name: 'Alice' },
      { id: 2, name: 'Bob' },
    ];
    const dataProvider = createDataProvider({
      getMany: async () => {
        return { rows };
      },
      fields: {
        id: { type: 'number' },
        name: { type: 'string' },
      },
    });

    const { getByText } = render(<DataGrid height={300} dataProvider={dataProvider} />);

    await waitFor(() => expect(getByText('Alice')).toBeTruthy());
  });
});
