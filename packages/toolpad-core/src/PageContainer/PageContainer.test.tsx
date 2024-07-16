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
          { slug: '', title: 'Home' },
          { slug: 'orders', title: 'Orders' },
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
});
