/**
 * @vitest-environment jsdom
 */

import * as React from 'react';
import { describe, test, expect, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import sinon from 'sinon';
import { LineChart as XLineChart } from '@mui/x-charts';
import { LineChart } from './LineChart';
import describeConformance from '../../test/describeConformance';

export const stubMatchMedia = (matches = true) =>
  sinon.stub().returns({
    matches,
    addEventListener: () => {},
    removeEventListener: () => {},
  });

describe('LineChart', () => {
  const originalMatchMedia = window.matchMedia;

  afterEach(() => {
    cleanup();
    window.matchMedia = originalMatchMedia;
  });

  describeConformance(<LineChart />, () => ({
    inheritComponent: XLineChart,
    refInstanceof: window.HTMLDivElement,
    skip: ['themeDefaultProps'],
  }));

  test('renders content correctly', async () => {
    window.matchMedia = stubMatchMedia(false);
    // placeholder test
    const { getByText } = render(<LineChart />);

    expect(getByText('No data to display')).toBeTruthy();
  });
});
