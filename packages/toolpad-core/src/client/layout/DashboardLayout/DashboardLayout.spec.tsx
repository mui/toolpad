import * as React from 'react';
import { describe, test, expect, afterEach } from 'vitest';
import { render, cleanup, within, waitFor } from '@testing-library/react';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import BarChartIcon from '@mui/icons-material/BarChart';
import DescriptionIcon from '@mui/icons-material/Description';
import LayersIcon from '@mui/icons-material/Layers';
import DashboardLayout from './DashboardLayout';
import BrandingContext from '../../context/BrandingContext';
import NavigationContext from '../../context/NavigationContext';

afterEach(cleanup);

describe('DashboardLayout', () => {
  test('renders content correctly', async () => {
    const { getByText } = render(<DashboardLayout>Hello world</DashboardLayout>);

    expect(getByText('Hello world')).toBeTruthy();
  });

  test('renders branding correctly in header', async () => {
    const BRANDING = {
      name: 'My Company',
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
    const NAVIGATION = [
      {
        title: 'Main items',
        routes: [
          {
            label: 'Dashboard',
            path: '/dashboard',
            icon: <DashboardIcon />,
          },
          {
            label: 'Orders',
            path: '/orders',
            icon: <ShoppingCartIcon />,
          },
        ],
      },
      {
        title: 'Analytics',
        routes: [
          {
            label: 'Reports',
            icon: <BarChartIcon />,
            routes: [
              {
                label: 'Sales',
                path: '/reports/sales',
                icon: <DescriptionIcon />,
              },
              {
                label: 'Traffic',
                path: '/reports/traffic',
                icon: <DescriptionIcon />,
              },
            ],
          },
          {
            label: 'Integrations',
            path: '/integrations',
            icon: <LayersIcon />,
          },
        ],
      },
    ];

    const { getByRole } = render(
      <NavigationContext.Provider value={NAVIGATION}>
        <DashboardLayout>Hello world</DashboardLayout>
      </NavigationContext.Provider>,
    );

    const navigation = getByRole('navigation');

    const mainItemsList = navigation.querySelector('[aria-labelledby="Main items"]') as HTMLElement;
    const analyticsList = navigation.querySelector('[aria-labelledby="Analytics"]') as HTMLElement;

    // Check list subheaders

    expect(within(mainItemsList).getByText('Main items')).toBeTruthy();
    expect(within(analyticsList).getByText('Analytics')).toBeTruthy();

    // Check list items and their links

    const mainItemsListDashboardItem = within(mainItemsList).getByText('Dashboard');
    const mainItemsListOrdersItem = within(mainItemsList).getByText('Orders');

    expect(mainItemsListDashboardItem).toBeTruthy();
    expect(mainItemsListOrdersItem).toBeTruthy();

    const mainItemsListDashboardItemLink = mainItemsListDashboardItem.closest('a') as HTMLElement;
    expect(mainItemsListDashboardItemLink.getAttribute('href')).toBe('/dashboard');
    const mainItemsListOrdersItemLink = mainItemsListOrdersItem.closest('a') as HTMLElement;
    expect(mainItemsListOrdersItemLink.getAttribute('href')).toBe('/orders');

    const analyticsListReportsItem = within(analyticsList).getByText('Reports');

    expect(analyticsListReportsItem).toBeTruthy();
    expect(within(analyticsList).getByText('Integrations')).toBeTruthy();

    expect(within(analyticsList).queryByText('Sales')).toBeNull();
    expect(within(analyticsList).queryByText('Traffic')).toBeNull();

    // Check nested list items

    analyticsListReportsItem.click();

    await waitFor(async () => {
      expect(within(analyticsList).getByText('Sales')).toBeTruthy();
      expect(within(analyticsList).getByText('Traffic')).toBeTruthy();
    });
  });
});
