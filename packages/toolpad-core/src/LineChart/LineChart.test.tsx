/**
 * @vitest-environment jsdom
 */

import * as React from 'react';
import { describe, test, expect, afterEach } from 'vitest';
import { render, waitFor, screen } from '@testing-library/react';
import sinon from 'sinon';
import { LineChart as XLineChart } from '@mui/x-charts';
import describeConformance from '@toolpad/utils/describeConformance';
import { LineChart } from './LineChart';

export const stubMatchMedia = (matches = true) =>
  sinon.stub().returns({
    matches,
    addEventListener: () => {},
    removeEventListener: () => {},
  });

describe('LineChart', () => {
  const originalMatchMedia = window.matchMedia;

  afterEach(() => {
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
    render(<LineChart height={300} />);

    await waitFor(
      () => {
        expect(screen.getByText('No data to display')).toBeTruthy();
      },
      { timeout: 1000 },
    );
  });
});
