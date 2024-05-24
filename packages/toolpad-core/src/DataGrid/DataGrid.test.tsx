/**
 * @vitest-environment jsdom
 */

import * as React from 'react';
import { describe, test, expect, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import { DataGrid } from './DataGrid';

describe('DataGrid', () => {
  afterEach(cleanup);

  test('renders content correctly', async () => {
    const { getByText } = render(<DataGrid />);

    expect(getByText('Columns')).toBeTruthy();
  });
});
