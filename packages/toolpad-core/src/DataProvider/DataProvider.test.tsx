/**
 * @vitest-environment jsdom
 */

import * as React from 'react';
import { describe, test, expect, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import { createDataProvider } from './DataProvider';
import { DataGrid } from '../DataGrid';

describe('DataProvider', () => {
  afterEach(cleanup);

  test('renders content correctly', async () => {
    // placeholder test
    const data = createDataProvider<any>({
      async getMany() {
        return { rows: [{ id: 1, hello: 'foo' }] };
      },
    });

    const { getByText } = render(<DataGrid dataProvider={data} />);

    expect(getByText('Columns')).toBeTruthy();
  });
});
