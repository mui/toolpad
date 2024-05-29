/**
 * @vitest-environment jsdom
 */

import * as React from 'react';
import { describe, test, expect, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import sinon from 'sinon';
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
    cleanup();
    window.matchMedia = originalMatchMedia;
  });

  test('renders content correctly', async () => {
    window.matchMedia = stubMatchMedia(false);
    // placeholder test
    const { getByText } = render(<LineChart />);

    //  expect(getByText('No data to display')).toBeTruthy();
  });
});
