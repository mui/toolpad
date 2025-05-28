import * as React from 'react';
import { describe, test } from 'vitest';
import { render } from 'vitest-browser-react';
import '@testing-library/jest-dom/vitest';
import { page } from '@vitest/browser/context';
import { AppProvider } from '../AppProvider';
import { DashboardLayout } from './DashboardLayout';

const IMG_URL =
  'data:image/svg+xml;utf8,<svg width="80" height="80" xmlns="http://www.w3.org/2000/svg"><text x="10" y="60" font-family="Arial, sans-serif" font-size="60" fill="black">M</text></svg>';

describe('DashboardLayout', () => {
  test('renders branding correctly in header', async () => {
    const BRANDING = {
      title: 'My Company',
      logo: <img src={IMG_URL} alt="Placeholder Logo" />,
    };

    render(
      <AppProvider branding={BRANDING}>
        <DashboardLayout>Hello world</DashboardLayout>
      </AppProvider>,
    );

    await page.screenshot();
  });
});
