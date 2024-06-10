/**
 * @vitest-environment jsdom
 */

import * as React from 'react';
import { describe, test, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DataGrid as XDataGrid } from '@mui/x-data-grid';
import describeConformance from '@toolpad/utils/describeConformance';
import { DataGrid } from './DataGrid';

describe('DataGrid', () => {
  describeConformance(<DataGrid />, () => ({
    inheritComponent: XDataGrid,
    refInstanceof: window.HTMLDivElement,
    skip: ['themeDefaultProps'],
  }));

  test('renders content correctly', async () => {
    // placeholder test
    render(<DataGrid />);

    expect(screen.getByText('Columns')).toBeTruthy();
  });
});
