/**
 * @vitest-environment jsdom
 */

import * as React from 'react';
import { expect, describe, test, afterEach } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/vitest';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import { AppProvider, Router } from '../AppProvider';
import { Crud } from './Crud';
import type { DataModel, DataSource } from './types';

type OrderStatus = 'pending' | 'sent';
type OrderTag = 'gift' | 'fragile' | 'wholesale';

interface Order extends DataModel {
  id: number;
  title: string;
  description?: string;
  status: OrderStatus;
  itemCount: number;
  fastDelivery: boolean;
  tags: OrderTag[];
  createdAt: string;
  deliveryTime?: string;
}

const INITIAL_ORDERS: Order[] = [
  {
    id: 1,
    title: 'Order 1',
    description: 'I am the first order',
    status: 'pending',
    priority: 1,
    itemCount: 1,
    fastDelivery: true,
    tags: [],
    createdAt: new Date().toISOString(),
  },
  {
    id: 2,
    title: 'Order 2',
    description: 'I am the second order',
    status: 'pending',
    priority: 2,
    itemCount: 2,
    fastDelivery: false,
    tags: ['gift'],
    createdAt: new Date().toISOString(),
  },
  {
    id: 3,
    title: 'Order 3',
    description: 'I am the third order',
    status: 'sent',
    priority: 3,
    itemCount: 3,
    fastDelivery: true,
    tags: ['gift', 'fragile'],
    createdAt: new Date().toISOString(),
  },
];

let ordersStore: Order[] = INITIAL_ORDERS;

function resetOrdersStore() {
  ordersStore = INITIAL_ORDERS;
}

function TagsFormField({
  value,
  onChange,
  error,
}: {
  value: OrderTag[];
  onChange: (value: OrderTag[]) => void | Promise<void>;
  error: string | null;
}) {
  const labelId = 'tags-label';
  const label = 'Tags';

  const handleChange = (event: SelectChangeEvent<string | string[]>) => {
    const updatedTags = event.target.value;
    onChange((typeof updatedTags === 'string' ? [updatedTags] : updatedTags) as OrderTag[]);
  };

  return (
    <FormControl error={!!error} fullWidth>
      <InputLabel id={labelId}>{label}</InputLabel>
      <Select
        multiple
        value={value ?? []}
        onChange={handleChange}
        labelId={labelId}
        name="tags"
        label={label}
        renderValue={(selected) => (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {selected.map((selectedValue) => (
              <Chip key={selectedValue} label={selectedValue} />
            ))}
          </Box>
        )}
        fullWidth
      >
        <MenuItem value="gift">Gift</MenuItem>
        <MenuItem value="fragile">Fragile</MenuItem>
        <MenuItem value="wholesale">Wholesale</MenuItem>
      </Select>
      <FormHelperText>{error ?? ' '}</FormHelperText>
    </FormControl>
  );
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
      valueOptions: [
        { value: 'pending', label: 'Pending' },
        { value: 'sent', label: 'Sent' },
      ],
    },
    {
      field: 'priority',
      headerName: 'Priority',
      type: 'singleSelect',
      valueOptions: [
        { value: 1, label: 'Low' },
        { value: 2, label: 'Medium' },
        { value: 3, label: 'High' },
      ],
    },
    { field: 'itemCount', headerName: 'No. of items', type: 'number' },
    { field: 'fastDelivery', headerName: 'Fast delivery', type: 'boolean' },
    {
      field: 'tags',
      headerName: 'Tags',
      valueFormatter: (value) => {
        return value && (value as string[]).join(', ');
      },
      renderFormField: ({ value, onChange, error }) => (
        <TagsFormField value={value as OrderTag[]} onChange={onChange} error={error} />
      ),
    },
    {
      field: 'createdAt',
      headerName: 'Created at',
      type: 'date',
      valueGetter: (value) => value && new Date(value),
    },
    {
      field: 'deliveryTime',
      headerName: 'Delivery time',
      type: 'dateTime',
      valueGetter: (value) => value && new Date(value),
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
    const newOrder = {
      id: ordersStore.reduce((max, order) => Math.max(max, order.id), 0) + 1,
      ...data,
    } as Order;

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
    expect(within(dataRows[0]).getByText('Low')).toBeInTheDocument();
    expect(within(dataRows[0]).getByText('yes')).toBeInTheDocument();

    expect(within(dataRows[1]).getByText('Order 2')).toBeInTheDocument();
    expect(within(dataRows[1]).getByText('I am the second order')).toBeInTheDocument();
    expect(within(dataRows[1]).getByText('Pending')).toBeInTheDocument();
    expect(within(dataRows[1]).getByText('Medium')).toBeInTheDocument();
    expect(within(dataRows[1]).getByText('no')).toBeInTheDocument();
    expect(within(dataRows[1]).getByText('gift')).toBeInTheDocument();

    expect(within(dataRows[2]).getByText('Order 3')).toBeInTheDocument();
    expect(within(dataRows[2]).getByText('I am the third order')).toBeInTheDocument();
    expect(within(dataRows[2]).getByText('Sent')).toBeInTheDocument();
    expect(within(dataRows[2]).getByText('High')).toBeInTheDocument();
    expect(within(dataRows[2]).getByText('yes')).toBeInTheDocument();
    expect(within(dataRows[2]).getByText('gift, fragile')).toBeInTheDocument();
  });

  test('shows item details correctly', async () => {
    const { unmount } = render(<AppWithRouter initialPath="/orders/1" />);

    await waitFor(() => {
      expect(screen.getByText('Order 1')).toBeInTheDocument();
    });

    expect(screen.getByText('I am the first order')).toBeInTheDocument();
    expect(screen.getByText('Pending')).toBeInTheDocument();
    expect(screen.getByText('Low')).toBeInTheDocument();
    expect(screen.getByText('Yes')).toBeInTheDocument();

    expect(screen.queryByText('Order 2')).not.toBeInTheDocument();

    unmount();
    render(<AppWithRouter initialPath="/orders/2" />);

    await waitFor(() => {
      expect(screen.getByText('Order 2')).toBeInTheDocument();
    });

    expect(screen.getByText('I am the second order')).toBeInTheDocument();
    expect(screen.getByText('Pending')).toBeInTheDocument();
    expect(screen.getByText('Medium')).toBeInTheDocument();
    expect(screen.getByText('No')).toBeInTheDocument();
    expect(screen.getByText('gift')).toBeInTheDocument();

    expect(screen.queryByText('Order 1')).not.toBeInTheDocument();
  });

  test('creates new items', async () => {
    render(<AppWithRouter initialPath="/orders/new" />);

    await userEvent.type(screen.getByLabelText('Description'), 'I am a new order');

    await userEvent.click(screen.getByLabelText('Status'));
    await userEvent.click(await screen.findByRole('option', { name: 'Sent' }));

    await userEvent.click(screen.getByLabelText('Priority'));
    await userEvent.click(await screen.findByRole('option', { name: 'High' }));

    await userEvent.click(screen.getByLabelText('Fast delivery'));

    await userEvent.click(screen.getByLabelText('Tags'));
    await userEvent.click(await screen.findByRole('option', { name: 'Gift' }));
    await userEvent.click(await screen.findByRole('option', { name: 'Wholesale' }));
    await userEvent.keyboard('{Escape}');

    await userEvent.click(screen.getByRole('button', { name: 'Create' }));

    await waitFor(() => {
      expect(screen.getByText('Order 1')).toBeInTheDocument();
    });

    const renderedRows = await screen.findAllByRole('row');

    const dataRows = renderedRows.slice(1);

    expect(within(dataRows[3]).getByText('New Order')).toBeInTheDocument();
    expect(within(dataRows[3]).getByText('I am a new order')).toBeInTheDocument();
    expect(within(dataRows[3]).getByText('Sent')).toBeInTheDocument();
    expect(within(dataRows[3]).getByText('High')).toBeInTheDocument();
    expect(within(dataRows[3]).getByText('yes')).toBeInTheDocument();
    expect(within(dataRows[3]).getByText('gift, wholesale')).toBeInTheDocument();
  });

  test('edits existing items', async () => {
    render(<AppWithRouter initialPath="/orders/1/edit" />);

    await waitFor(() => {
      expect(screen.getByLabelText('Title')).toHaveValue('Order 1');
    });

    expect(screen.getByLabelText('Description')).toHaveValue('I am the first order');
    expect(screen.getByLabelText('Status')).toHaveTextContent('Pending');
    expect(screen.getByLabelText('Priority')).toHaveTextContent('Low');
    expect(screen.getByLabelText('Fast delivery')).toBeChecked();

    await userEvent.clear(screen.getByLabelText('Title'));
    await userEvent.type(screen.getByLabelText('Title'), 'Edited Order');

    await userEvent.clear(screen.getByLabelText('Description'));
    await userEvent.type(screen.getByLabelText('Description'), 'I am an edited order');

    await userEvent.click(screen.getByLabelText('Status'));
    await userEvent.click(await screen.findByRole('option', { name: 'Sent' }));

    await userEvent.click(screen.getByLabelText('Priority'));
    await userEvent.click(await screen.findByRole('option', { name: 'Medium' }));

    await userEvent.click(screen.getByLabelText('Fast delivery'));

    await userEvent.click(screen.getByLabelText('Tags'));
    await userEvent.click(await screen.findByRole('option', { name: 'Fragile' }));
    await userEvent.keyboard('{Escape}');

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
    expect(within(dataRows[0]).getByText('Medium')).toBeInTheDocument();
    expect(within(dataRows[0]).getByText('no')).toBeInTheDocument();
    expect(within(dataRows[0]).getByText('fragile')).toBeInTheDocument();
  }, 10000);

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
