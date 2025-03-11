/**
 * @vitest-environment jsdom
 */

import * as React from 'react';
import { expect, describe, test, afterEach } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/vitest';
import { AppProvider, Router } from '../AppProvider';
import { Crud } from './Crud';
import type { DataModel, DataSource } from './types';

type OrderStatus = 'Pending' | 'Sent';

interface Order extends DataModel {
  id: number;
  title: string;
  description?: string;
  status: OrderStatus;
  itemCount: number;
  fastDelivery: boolean;
  createdAt: string;
  deliveryTime?: string;
}

const INITIAL_ORDERS: Order[] = [
  {
    id: 1,
    title: 'Order 1',
    description: 'I am the first order',
    status: 'Pending',
    itemCount: 1,
    fastDelivery: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 2,
    title: 'Order 2',
    description: 'I am the second order',
    status: 'Pending',
    itemCount: 2,
    fastDelivery: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 3,
    title: 'Order 3',
    description: 'I am the third order',
    status: 'Sent',
    itemCount: 3,
    fastDelivery: true,
    createdAt: new Date().toISOString(),
  },
];

let ordersStore: Order[] = INITIAL_ORDERS;

function resetOrdersStore() {
  ordersStore = INITIAL_ORDERS;
}

const ordersDataSource: DataSource<Order> = {
  fields: [
    { field: 'id', headerName: 'ID' },
    { field: 'title', headerName: 'Title' },
    { field: 'description', headerName: 'Description' },
    {
      field: 'status',
      headerName: 'Status',
      type: 'singleSelect',
      valueOptions: ['Pending', 'Sent'],
    },
    { field: 'itemCount', headerName: 'No. of items', type: 'number' },
    { field: 'fastDelivery', headerName: 'Fast delivery', type: 'boolean' },
    {
      field: 'createdAt',
      headerName: 'Created at',
      type: 'date',
      valueGetter: (value: string) => value && new Date(value),
    },
    {
      field: 'deliveryTime',
      headerName: 'Delivery time',
      type: 'dateTime',
      valueGetter: (value: string) => value && new Date(value),
    },
  ],
  getMany: ({ paginationModel }) => {
    // Apply pagination
    const start = paginationModel.page * paginationModel.pageSize;
    const end = start + paginationModel.pageSize;
    const paginatedOrders = ordersStore.slice(start, end);

    return {
      items: paginatedOrders,
      itemCount: ordersStore.length,
    };
  },
  getOne: (orderId) => {
    const orderToShow = ordersStore.find((order) => order.id === Number(orderId));

    if (!orderToShow) {
      throw new Error('Order not found');
    }
    return orderToShow;
  },
  createOne: (data) => {
    const newOrder = { id: ordersStore.length + 1, ...data } as Order;

    ordersStore = [...ordersStore, newOrder];

    return newOrder;
  },
  updateOne: (orderId, data) => {
    let updatedOrder: Order | null = null;

    ordersStore = ordersStore.map((order) => {
      if (order.id === Number(orderId)) {
        updatedOrder = { ...order, ...data };
        return updatedOrder;
      }
      return order;
    });

    if (!updatedOrder) {
      throw new Error('Order not found');
    }

    return updatedOrder;
  },
  deleteOne: (orderId) => {
    ordersStore = ordersStore.filter((order) => order.id !== Number(orderId));
  },
  validate: (formValues) => {
    let issues: { message: string; path: [keyof Order] }[] = [];

    if (!formValues.title) {
      issues = [...issues, { message: 'Title is required', path: ['title'] }];
    }
    if (formValues.title && formValues.title.length < 3) {
      issues = [
        ...issues,
        {
          message: 'Title must be at least 3 characters long',
          path: ['title'],
        },
      ];
    }
    if (!formValues.description) {
      issues = [...issues, { message: 'Description is required', path: ['description'] }];
    }

    return { issues };
  },
};

function AppWithRouter({ initialPath = '/' }: { initialPath: string }) {
  const [url, setUrl] = React.useState(() => new URL(initialPath, window.location.origin));

  const router = React.useMemo<Router>(() => {
    return {
      pathname: url.pathname,
      searchParams: url.searchParams,
      navigate: (newUrl) => {
        const nextUrl = new URL(newUrl, window.location.origin);
        if (nextUrl.pathname !== url.pathname || nextUrl.search !== url.search) {
          setUrl(nextUrl);
        }
      },
    };
  }, [url.pathname, url.search, url.searchParams]);

  return (
    <AppProvider
      navigation={[{ segment: 'orders', title: 'Orders', pattern: 'orders{/:orderId}*' }]}
      router={router}
    >
      <Crud
        dataSource={ordersDataSource}
        rootPath="/orders"
        defaultValues={{ title: 'New Order' }}
      />
    </AppProvider>
  );
}

describe('Crud', () => {
  afterEach(() => {
    resetOrdersStore();
  });

  test('renders list items correctly', async () => {
    render(<AppWithRouter initialPath="/orders" />);

    await waitFor(() => {
      expect(screen.getByText('Order 1')).toBeInTheDocument();
    });

    const renderedRows = await screen.findAllByRole('row');

    const dataRows = renderedRows.slice(1);

    expect(within(dataRows[0]).getByText('I am the first order')).toBeInTheDocument();
    expect(within(dataRows[0]).getByText('Pending')).toBeInTheDocument();
    expect(within(dataRows[0]).getByText('yes')).toBeInTheDocument();

    expect(within(dataRows[1]).getByText('Order 2')).toBeInTheDocument();
    expect(within(dataRows[1]).getByText('I am the second order')).toBeInTheDocument();
    expect(within(dataRows[1]).getByText('Pending')).toBeInTheDocument();
    expect(within(dataRows[1]).getByText('no')).toBeInTheDocument();

    expect(within(dataRows[2]).getByText('Order 3')).toBeInTheDocument();
    expect(within(dataRows[2]).getByText('I am the third order')).toBeInTheDocument();
    expect(within(dataRows[2]).getByText('Sent')).toBeInTheDocument();
    expect(within(dataRows[2]).getByText('yes')).toBeInTheDocument();
  });

  test('shows item details correctly', async () => {
    const { unmount } = render(<AppWithRouter initialPath="/orders/1" />);

    await waitFor(() => {
      expect(screen.getByText('Order 1')).toBeInTheDocument();
    });

    expect(screen.getByText('I am the first order')).toBeInTheDocument();
    expect(screen.getByText('Pending')).toBeInTheDocument();
    expect(screen.getByText('Yes')).toBeInTheDocument();

    expect(screen.queryByText('Order 2')).not.toBeInTheDocument();

    unmount();
    render(<AppWithRouter initialPath="/orders/2" />);

    await waitFor(() => {
      expect(screen.getByText('Order 2')).toBeInTheDocument();
    });

    expect(screen.getByText('I am the second order')).toBeInTheDocument();
    expect(screen.getByText('Pending')).toBeInTheDocument();
    expect(screen.getByText('No')).toBeInTheDocument();

    expect(screen.queryByText('Order 1')).not.toBeInTheDocument();
  });

  test('creates new items', async () => {
    render(<AppWithRouter initialPath="/orders/new" />);

    await userEvent.type(screen.getByLabelText('Description'), 'I am a new order');

    await userEvent.click(screen.getByLabelText('Status'));
    await userEvent.click(await screen.findByRole('option', { name: 'Sent' }));

    await userEvent.click(screen.getByLabelText('Fast delivery'));

    await userEvent.click(screen.getByRole('button', { name: 'Create' }));

    await waitFor(() => {
      expect(screen.getByText('Order 1')).toBeInTheDocument();
    });

    const renderedRows = await screen.findAllByRole('row');

    const dataRows = renderedRows.slice(1);

    expect(within(dataRows[3]).getByText('New Order')).toBeInTheDocument();
    expect(within(dataRows[3]).getByText('I am a new order')).toBeInTheDocument();
    expect(within(dataRows[3]).getByText('Sent')).toBeInTheDocument();
    expect(within(dataRows[3]).getByText('yes')).toBeInTheDocument();
  });

  test('edits existing items', async () => {
    render(<AppWithRouter initialPath="/orders/1/edit" />);

    await waitFor(() => {
      expect(screen.getByLabelText('Title')).toHaveValue('Order 1');
    });

    expect(screen.getByLabelText('Description')).toHaveValue('I am the first order');
    expect(screen.getByLabelText('Status')).toHaveTextContent('Pending');
    expect(screen.getByLabelText('Fast delivery')).toBeChecked();

    await userEvent.clear(screen.getByLabelText('Title'));
    await userEvent.type(screen.getByLabelText('Title'), 'Edited Order');

    await userEvent.clear(screen.getByLabelText('Description'));
    await userEvent.type(screen.getByLabelText('Description'), 'I am an edited order');

    await userEvent.click(screen.getByLabelText('Status'));
    await userEvent.click(await screen.findByRole('option', { name: 'Sent' }));

    await userEvent.click(screen.getByLabelText('Fast delivery'));

    await userEvent.click(screen.getByRole('button', { name: 'Edit' }));

    await waitFor(() => {
      expect(screen.getByText('Order 2')).toBeInTheDocument();
    });

    expect(screen.queryByText('Order 1')).not.toBeInTheDocument();

    const renderedRows = await screen.findAllByRole('row');

    const dataRows = renderedRows.slice(1);

    expect(within(dataRows[0]).getByText('Edited Order')).toBeInTheDocument();
    expect(within(dataRows[0]).getByText('I am an edited order')).toBeInTheDocument();
    expect(within(dataRows[0]).getByText('Sent')).toBeInTheDocument();
    expect(within(dataRows[0]).getByText('no')).toBeInTheDocument();
  });

  test('deletes items from list view', async () => {
    render(<AppWithRouter initialPath="/orders" />);

    await waitFor(() => {
      expect(screen.getByText('Order 1')).toBeInTheDocument();
    });

    const renderedRows = await screen.findAllByRole('row');
    const dataRows = renderedRows.slice(1);

    expect(dataRows).toHaveLength(3);

    await userEvent.click(within(dataRows[0]).getByLabelText('Delete'));
    await userEvent.click(screen.getByRole('button', { name: 'Delete' }));

    expect(screen.queryByText('Order 1')).not.toBeInTheDocument();

    const updatedRenderedRows = await screen.findAllByRole('row');
    const updatedDataRows = updatedRenderedRows.slice(1);

    expect(updatedDataRows).toHaveLength(2);
  });

  test('deletes items from detail view', async () => {
    render(<AppWithRouter initialPath="/orders/1" />);

    await waitFor(() => {
      expect(screen.getByText('Order 1')).toBeInTheDocument();
    });

    await userEvent.click(screen.getByRole('button', { name: 'Delete' }));
    await userEvent.click(screen.getByRole('button', { name: 'Delete' }));

    expect(screen.queryByText('Order 1')).not.toBeInTheDocument();

    const updatedRenderedRows = await screen.findAllByRole('row');
    const updatedDataRows = updatedRenderedRows.slice(1);

    expect(updatedDataRows).toHaveLength(2);
  });
});
