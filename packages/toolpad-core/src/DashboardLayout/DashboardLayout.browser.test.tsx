/**
 * @vitest-environment browser
 */

import * as React from 'react';
import { describe, test } from 'vitest';
import { render } from 'vitest-browser-react';
import '@testing-library/jest-dom/vitest';
import { page } from '@vitest/browser/context';
import { AppProvider } from '../AppProvider';
import { DashboardLayout } from './DashboardLayout';

describe('DashboardLayout', () => {
  test('renders branding correctly in header', async () => {
    const BRANDING = {
      title: 'My Company',
      logo: <img src="https://placehold.co/600x400" alt="Placeholder Logo" />,
    };

    render(
      <AppProvider branding={BRANDING}>
        <DashboardLayout>Hello world</DashboardLayout>
      </AppProvider>,
    );
    await page.screenshot();
  });
});
