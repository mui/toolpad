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
      toolbar: {},
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

    const breadCrumbs = screen.getByRole('navigation', { name: 'breadcrumb' });

    const homeLink = within(breadCrumbs).getByRole('link', { name: 'Home' });
    await user.click(homeLink);

    expect(router.navigate).toHaveBeenCalledWith('/', expect.objectContaining({}));
    router.navigate.mockClear();

    expect(within(breadCrumbs).getByText('Orders')).toBeTruthy();

    expect(screen.getByText('Orders', { ignore: 'nav *' }));
  });

  test('renders nested', async () => {
    const navigation = [
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

    const breadCrumbs = screen.getByRole('navigation', { name: 'breadcrumb' });

    expect(within(breadCrumbs).getByText('ACME')).toBeTruthy();
    expect(within(breadCrumbs).getByText('Home')).toBeTruthy();
    expect(within(breadCrumbs).getByText('Orders')).toBeTruthy();
  });
});
