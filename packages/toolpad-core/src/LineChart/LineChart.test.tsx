/**
 * @vitest-environment jsdom
 */

import * as React from 'react';
import { describe, test, expect, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import { LineChart } from './LineChart';

describe('LineChart', () => {
  afterEach(cleanup);

  test('renders content correctly', async () => {
    // placeholder test
    const { getByText } = render(<LineChart />);

    expect(getByText('No data to display')).toBeTruthy();
  });
});
