/**
 * @vitest-environment jsdom
 */

import * as React from 'react';
import { expect, describe, test, vi } from 'vitest';
import describeConformance from '@toolpad/utils/describeConformance';
import { render, within, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { PageContainer } from './PageContainer';
import { AppProvider } from '../AppProvider';

describe('PageContainer', () => {
  describeConformance(<PageContainer />, () => ({
    skip: ['themeDefaultProps'],
    slots: {
      header: {},
    },
  }));

  test('renders page container correctly', async () => {
    const user = await userEvent.setup();
    const router = { pathname: '/orders', searchParams: new URLSearchParams(), navigate: vi.fn() };
    render(
      <AppProvider
        navigation={[
          { segment: '', title: 'Home' },
          { segment: 'orders', title: 'Orders' },
        ]}
        router={router}
      >
        <PageContainer />
      </AppProvider>,
    );

    const breadcrumbs = screen.getByRole('navigation', { name: 'breadcrumb' });

    const homeLink = within(breadcrumbs).getByRole('link', { name: 'Home' });
    await user.click(homeLink);

    expect(router.navigate).toHaveBeenCalledWith('/', expect.objectContaining({}));
    router.navigate.mockClear();

    expect(within(breadcrumbs).getByText('Orders')).toBeTruthy();

    expect(screen.getByText('Orders', { ignore: 'nav *' }));
  });

  test('renders nested', async () => {
    const navigation = [
      { segment: '', title: 'ACME' },
      {
        segment: 'home',
        title: 'Home',
        children: [
          {
            segment: 'orders',
            title: 'Orders',
          },
        ],
      },
    ];

    const router = {
      pathname: '/home/orders',
      searchParams: new URLSearchParams(),
      navigate: vi.fn(),
    };

    const branding = { title: 'ACME' };
    render(
      <AppProvider branding={branding} navigation={navigation} router={router}>
        <PageContainer />
      </AppProvider>,
    );

    const breadcrumbs = screen.getByRole('navigation', { name: 'breadcrumb' });

    expect(within(breadcrumbs).getByText('ACME')).toBeTruthy();
    expect(within(breadcrumbs).getByText('Home')).toBeTruthy();
    expect(within(breadcrumbs).getByText('Orders')).toBeTruthy();
  });

  test('renders dynamic correctly', async () => {
    const user = await userEvent.setup();
    const router = {
      pathname: '/orders/123',
      searchParams: new URLSearchParams(),
      navigate: vi.fn(),
    };
    render(
      <AppProvider
        navigation={[
          { segment: '', title: 'Home' },
          { segment: 'orders', title: 'Orders', pattern: 'orders/:id' },
        ]}
        router={router}
      >
        <PageContainer />
      </AppProvider>,
    );

    const breadcrumbs = screen.getByRole('navigation', { name: 'breadcrumb' });

    const homeLink = within(breadcrumbs).getByRole('link', { name: 'Home' });
    await user.click(homeLink);

    expect(router.navigate).toHaveBeenCalledWith('/', expect.objectContaining({}));
    router.navigate.mockClear();

    expect(within(breadcrumbs).getByText('Orders')).toBeTruthy();

    expect(screen.getByText('Orders', { ignore: 'nav *' }));
  });

  test('renders nested dynamic correctly', async () => {
    const router = {
      pathname: '/users/invoices/123',
      searchParams: new URLSearchParams(),
      navigate: vi.fn(),
    };
    render(
      <AppProvider
        navigation={[
          {
            segment: 'users',
            title: 'Users',
            children: [{ segment: 'invoices', title: 'Invoices', pattern: 'invoices/:id' }],
          },
        ]}
        router={router}
      >
        <PageContainer />
      </AppProvider>,
    );

    const breadcrumbs = screen.getByRole('navigation', { name: 'breadcrumb' });

    const homeLink = within(breadcrumbs).getByRole('link', { name: 'Users' });
    expect(homeLink.getAttribute('href')).toBe('/users');
    expect(within(breadcrumbs).getByText('Invoices')).toBeTruthy();
  });

  test('renders custom breadcrumbs', async () => {
    render(
      <PageContainer
        breadcrumbs={[
          { title: 'Hello', path: '/hello' },
          { title: 'World', path: '/world' },
        ]}
      />,
    );

    const breadcrumbs = screen.getByRole('navigation', { name: 'breadcrumb' });

    const helloLink = within(breadcrumbs).getByRole('link', { name: 'Hello' });
    expect(helloLink.getAttribute('href')).toBe('/hello');
    expect(within(breadcrumbs).getByText('World')).toBeTruthy();
  });

  test("doesn't spread title to child", async () => {
    render(<PageContainer title="Hello World" />);

    expect(screen.queryByTitle('Hello World')).not.toBeInTheDocument();
  });
});
