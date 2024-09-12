/**
 * @vitest-environment jsdom
 */

import * as React from 'react';
import { describe, test, expect, vi } from 'vitest';
import { render, within, screen } from '@testing-library/react';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import BarChartIcon from '@mui/icons-material/BarChart';
import DescriptionIcon from '@mui/icons-material/Description';
import LayersIcon from '@mui/icons-material/Layers';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/vitest';
import { AppProvider, Navigation } from '../AppProvider';
import { DashboardLayout } from './DashboardLayout';

describe('DashboardLayout', () => {
  test('renders content correctly', async () => {
    render(<DashboardLayout>Hello world</DashboardLayout>);

    expect(screen.getByText('Hello world')).toBeTruthy();
  });

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

    const header = screen.getByRole('banner');

    expect(within(header).getByText('My Company')).toBeTruthy();
    expect(within(header).getByAltText('Placeholder Logo')).toBeTruthy();
  });

  test('can switch theme', async () => {
    const user = userEvent.setup();

    render(
      <AppProvider>
        <DashboardLayout>Hello world</DashboardLayout>
      </AppProvider>,
    );

    const getBackgroundColorCSSVariable = () =>
      getComputedStyle(document.documentElement).getPropertyValue(
        '--mui-palette-common-background',
      );

    const header = screen.getByRole('banner');

    const themeSwitcherButton = within(header).getByLabelText('Switch to dark mode');

    expect(getBackgroundColorCSSVariable()).toBe('#fff');

    await user.click(themeSwitcherButton);

    expect(getBackgroundColorCSSVariable()).toBe('#000');

    await user.click(themeSwitcherButton);

    expect(getBackgroundColorCSSVariable()).toBe('#fff');
  });

  test('navigation works correctly', async () => {
    const NAVIGATION: Navigation = [
      {
        kind: 'header',
        title: 'Main items',
      },
      {
        title: 'Dashboard',
        segment: 'dashboard',
        icon: <DashboardIcon />,
      },
      {
        title: 'Orders',
        segment: 'orders',
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
        segment: 'reports',
        title: 'Reports',
        icon: <BarChartIcon />,
        children: [
          {
            segment: 'sales',
            title: 'Sales',
            icon: <DescriptionIcon />,
          },
          {
            segment: 'traffic',
            title: 'Traffic',
            icon: <DescriptionIcon />,
          },
        ],
      },
      {
        segment: 'integrations',
        title: 'Integrations',
        icon: <LayersIcon />,
      },
    ];

    const user = userEvent.setup();

    render(
      <AppProvider navigation={NAVIGATION}>
        <DashboardLayout>Hello world</DashboardLayout>
      </AppProvider>,
    );

    const navigation = screen.getByRole('navigation');

    // List subheaders are present

    expect(within(navigation).getByText('Main items')).toBeTruthy();
    expect(within(navigation).getByText('Analytics')).toBeTruthy();

    // List items and their links are present

    const dashboardLink = within(navigation).getByRole('link', { name: 'Dashboard' });
    const ordersLink = within(navigation).getByRole('link', { name: 'Orders' });

    expect(dashboardLink.getAttribute('href')).toBe('/dashboard');
    expect(ordersLink.getAttribute('href')).toBe('/orders');

    const reportsItem = within(navigation).getByText('Reports');

    expect(reportsItem).toBeTruthy();
    expect(within(navigation).getByText('Integrations')).toBeTruthy();

    // Nested list items show when parent item is clicked

    expect(within(navigation).queryByText('Sales')).toBeNull();
    expect(within(navigation).queryByText('Traffic')).toBeNull();

    await user.click(reportsItem);

    expect(within(navigation).getByText('Sales')).toBeTruthy();
    expect(within(navigation).getByText('Traffic')).toBeTruthy();
  });

  test('starts with parent items expanded if any of their children is the current page', () => {
    const NAVIGATION: Navigation = [
      {
        segment: 'reports',
        title: 'Reports',
        icon: <BarChartIcon />,
        children: [
          {
            segment: 'sales',
            title: 'Sales',
            icon: <DescriptionIcon />,
          },
          {
            segment: 'traffic',
            title: 'Traffic',
            icon: <DescriptionIcon />,
          },
        ],
      },
    ];

    const mockRouter = {
      pathname: '/reports/sales',
      searchParams: new URLSearchParams(),
      navigate: vi.fn(),
    };

    render(
      <AppProvider navigation={NAVIGATION} router={mockRouter}>
        <DashboardLayout>Hello world</DashboardLayout>
      </AppProvider>,
    );

    const navigation = screen.getByRole('navigation');

    expect(within(navigation).getByText('Sales')).toBeTruthy();
    expect(within(navigation).getByText('Traffic')).toBeTruthy();
  });

  test('shows correct selected page item', () => {
    const NAVIGATION: Navigation = [
      {
        title: 'Dashboard',
        segment: 'dashboard',
        icon: <DashboardIcon />,
      },
      {
        title: 'Orders',
        segment: 'orders',
        icon: <ShoppingCartIcon />,
      },
      {
        segment: 'dynamic',
        title: 'Dynamic',
        icon: <BarChartIcon />,
        pattern: '/dynamic/:dynamicId',
      },
      {
        segment: 'oneOrMore',
        title: 'One or more',
        pattern: '/oneormore/*oneormoreId',
      },
      {
        segment: 'optional',
        title: 'Optional',
        pattern: '/optional{/:optionalId}',
      },
      {
        segment: 'zeroOrMore',
        title: 'Zero or more',
        pattern: '/zeroormore{/*zeroormoreId}',
      },
    ];

    function AppWithPathname({ pathname }: { pathname: string }) {
      const mockRouter = {
        pathname,
        searchParams: new URLSearchParams(),
        navigate: vi.fn(),
      };

      return (
        <AppProvider navigation={NAVIGATION} router={mockRouter}>
          <DashboardLayout>Hello world</DashboardLayout>
        </AppProvider>
      );
    }

    const { rerender } = render(<AppWithPathname pathname="/dashboard" />);

    const navigation = screen.getByRole('navigation');

    expect(within(navigation).getByRole('link', { name: 'Dashboard' })).toHaveClass('Mui-selected');

    rerender(<AppWithPathname pathname="/orders" />);

    expect(within(navigation).getByRole('link', { name: 'Dashboard' })).not.toHaveClass(
      'Mui-selected',
    );
    expect(within(navigation).getByRole('link', { name: 'Orders' })).toHaveClass('Mui-selected');

    rerender(<AppWithPathname pathname="/dynamic/123" />);
    expect(within(navigation).getByRole('link', { name: 'Dynamic' })).toHaveClass('Mui-selected');

    rerender(<AppWithPathname pathname="/oneormore" />);
    expect(within(navigation).getByRole('link', { name: 'One or more' })).not.toHaveClass(
      'Mui-selected',
    );
    rerender(<AppWithPathname pathname="/oneormore/123" />);
    expect(within(navigation).getByRole('link', { name: 'One or more' })).toHaveClass(
      'Mui-selected',
    );
    rerender(<AppWithPathname pathname="/oneormore/123/456" />);
    expect(within(navigation).getByRole('link', { name: 'One or more' })).toHaveClass(
      'Mui-selected',
    );

    rerender(<AppWithPathname pathname="/optional" />);
    expect(within(navigation).getByRole('link', { name: 'Optional' })).toHaveClass('Mui-selected');
    rerender(<AppWithPathname pathname="/optional/123" />);
    expect(within(navigation).getByRole('link', { name: 'Optional' })).toHaveClass('Mui-selected');

    rerender(<AppWithPathname pathname="/zeroormore" />);
    expect(within(navigation).getByRole('link', { name: 'Zero or more' })).toHaveClass(
      'Mui-selected',
    );
    rerender(<AppWithPathname pathname="/zeroormore/123" />);
    expect(within(navigation).getByRole('link', { name: 'Zero or more' })).toHaveClass(
      'Mui-selected',
    );
    rerender(<AppWithPathname pathname="/zeroormore/123/456" />);
    expect(within(navigation).getByRole('link', { name: 'Zero or more' })).toHaveClass(
      'Mui-selected',
    );
  });

  test('renders navigation actions', async () => {
    const NAVIGATION: Navigation = [
      {
        title: 'Item 1',
        segment: 'item1',
        icon: <DescriptionIcon />,
        action: <div>Action 1</div>,
      },
      {
        title: 'Item',
        segment: 'item2',
        icon: <DescriptionIcon />,
        action: <div>Action 2</div>,
      },
    ];

    render(
      <AppProvider navigation={NAVIGATION}>
        <DashboardLayout>Hello world</DashboardLayout>
      </AppProvider>,
    );

    const navigation = screen.getByRole('navigation');

    expect(within(navigation).getByText('Action 1')).toBeTruthy();
    expect(within(navigation).getByText('Action 2')).toBeTruthy();
  });
});
