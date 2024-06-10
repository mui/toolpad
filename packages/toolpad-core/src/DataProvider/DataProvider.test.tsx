/**
 * @vitest-environment jsdom
 */

import * as React from 'react';
import { describe, test, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { createDataProvider } from './DataProvider';
import { DataGrid } from '../DataGrid';

describe('DataProvider', () => {
  test('renders content correctly', async () => {
    // placeholder test
    const data = createDataProvider<any>({
      async getMany() {
        return { rows: [{ id: 1, hello: 'foo' }] };
      },
    });

    render(<DataGrid dataProvider={data} />);

    expect(screen.getByText('Columns')).toBeTruthy();
  });
});
