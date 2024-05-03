/**
 * @vitest-environment jsdom
 */

import * as React from 'react';
import { describe, test, expect, afterEach } from 'vitest';
import { render, cleanup, within, waitFor } from '@testing-library/react';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import BarChartIcon from '@mui/icons-material/BarChart';
import DescriptionIcon from '@mui/icons-material/Description';
import LayersIcon from '@mui/icons-material/Layers';
import { DashboardLayout } from './DashboardLayout';
import { BrandingContext, Navigation, NavigationContext } from '../AppProvider';

describe('DashboardLayout', () => {
  afterEach(cleanup);

  test('renders content correctly', async () => {
    const { getByText } = render(<DashboardLayout>Hello world</DashboardLayout>);

    expect(getByText('Hello world')).toBeTruthy();
  });

  test('renders branding correctly in header', async () => {
    const BRANDING = {
      title: 'My Company',
      logo: <img src="https://placehold.co/600x400" alt="Placeholder Logo" />,
    };

    const { getByRole } = render(
      <BrandingContext.Provider value={BRANDING}>
        <DashboardLayout>Hello world</DashboardLayout>
      </BrandingContext.Provider>,
    );

    const header = getByRole('banner');

    expect(within(header).getByText('My Company')).toBeTruthy();
    expect(within(header).getByAltText('Placeholder Logo')).toBeTruthy();
  });

  test('navigation works correctly', async () => {
    const NAVIGATION: Navigation = [
      {
        kind: 'header',
        title: 'Main items',
      },
      {
        title: 'Dashboard',
        path: '/dashboard',
        icon: <DashboardIcon />,
      },
      {
        title: 'Orders',
        path: '/orders',
        icon: <ShoppingCartIcon />,
      },
      {
        kind: 'divider',
      },
      {
        kind: 'header',
        title: 'Analytics',
      },
      {
        title: 'Reports',
        icon: <BarChartIcon />,
        children: [
          {
            title: 'Sales',
            icon: <DescriptionIcon />,
          },
          {
            title: 'Traffic',
            icon: <DescriptionIcon />,
          },
        ],
      },
      {
        title: 'Integrations',
        icon: <LayersIcon />,
      },
    ];

    const { getByRole } = render(
      <NavigationContext.Provider value={NAVIGATION}>
        <DashboardLayout>Hello world</DashboardLayout>
      </NavigationContext.Provider>,
    );

    const navigation = getByRole('navigation');

    // Check list subheaders

    expect(within(navigation).getByText('Main items')).toBeTruthy();
    expect(within(navigation).getByText('Analytics')).toBeTruthy();

    // Check list items and their links

    const dashboardItem = within(navigation).getByText('Dashboard');
    const ordersItem = within(navigation).getByText('Orders');

    expect(dashboardItem).toBeTruthy();
    expect(ordersItem).toBeTruthy();

    const dashboardItemLink = dashboardItem.closest('a') as HTMLElement;
    expect(dashboardItemLink.getAttribute('href')).toBe('/dashboard');
    const ordersItemLink = ordersItem.closest('a') as HTMLElement;
    expect(ordersItemLink.getAttribute('href')).toBe('/orders');

    const reportsItem = within(navigation).getByText('Reports');

    expect(reportsItem).toBeTruthy();
    expect(within(navigation).getByText('Integrations')).toBeTruthy();

    expect(within(navigation).queryByText('Sales')).toBeNull();
    expect(within(navigation).queryByText('Traffic')).toBeNull();

    // Check nested list items

    reportsItem.click();

    await waitFor(async () => {
      expect(within(navigation).getByText('Sales')).toBeTruthy();
      expect(within(navigation).getByText('Traffic')).toBeTruthy();
    });
  });
});
