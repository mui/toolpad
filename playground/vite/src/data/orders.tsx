import * as React from 'react';
import { DataModel, DataSource, DataSourceCache } from '@toolpad/core/Crud';
import { z } from 'zod';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select, { SelectChangeEvent } from '@mui/material/Select';

type OrderStatus = 'pending' | 'sent';
type OrderTag = 'gift' | 'fragile' | 'wholesale';

export interface Order extends DataModel {
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

const getOrdersStore = (): Order[] => {
  const value = localStorage.getItem('orders-store');
  return value ? JSON.parse(value) : [];
};

const setOrdersStore = (value: Order[]) => {
  return localStorage.setItem('orders-store', JSON.stringify(value));
};

function TagsFormField({
  value,
  onChange,
  error,
}: {
  value: OrderTag[];
  onChange: (value: OrderTag | OrderTag[]) => void | Promise<void>;
  error?: string;
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

export const ordersDataSource: DataSource<Order> = {
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
  getMany: async ({ paginationModel, filterModel, sortModel }) => {
    // Simulate loading delay
    await new Promise((resolve) => {
      setTimeout(resolve, 750);
    });

    const ordersStore = getOrdersStore();

    let filteredOrders = [...ordersStore];

    // Apply filters (example only)
    if (filterModel?.items?.length) {
      filterModel.items.forEach(({ field, value, operator }) => {
        if (!field || value == null) {
          return;
        }

        filteredOrders = filteredOrders.filter((order) => {
          const orderValue = order[field];

          switch (operator) {
            case 'contains':
              return String(orderValue).toLowerCase().includes(String(value).toLowerCase());
            case 'equals':
              return orderValue === value;
            case 'startsWith':
              return String(orderValue).toLowerCase().startsWith(String(value).toLowerCase());
            case 'endsWith':
              return String(orderValue).toLowerCase().endsWith(String(value).toLowerCase());
            case '>':
              return (orderValue as number) > value;
            case '<':
              return (orderValue as number) < value;
            default:
              return true;
          }
        });
      });
    }

    // Apply sorting
    if (sortModel?.length) {
      filteredOrders.sort((a, b) => {
        for (const { field, sort } of sortModel) {
          if ((a[field] as number) < (b[field] as number)) {
            return sort === 'asc' ? -1 : 1;
          }
          if ((a[field] as number) > (b[field] as number)) {
            return sort === 'asc' ? 1 : -1;
          }
        }
        return 0;
      });
    }

    // Apply pagination
    const start = paginationModel.page * paginationModel.pageSize;
    const end = start + paginationModel.pageSize;
    const paginatedOrders = filteredOrders.slice(start, end);

    return {
      items: paginatedOrders,
      itemCount: filteredOrders.length,
    };
  },
  getOne: async (orderId) => {
    // Simulate loading delay
    await new Promise((resolve) => {
      setTimeout(resolve, 750);
    });

    const ordersStore = getOrdersStore();

    const orderToShow = ordersStore.find((order) => order.id === Number(orderId));

    if (!orderToShow) {
      throw new Error('Order not found');
    }
    return orderToShow;
  },
  createOne: async (data) => {
    // Simulate loading delay
    await new Promise((resolve) => {
      setTimeout(resolve, 750);
    });

    const ordersStore = getOrdersStore();

    const newOrder = {
      id: ordersStore.reduce((max, order) => Math.max(max, order.id), 0) + 1,
      ...data,
    } as Order;

    setOrdersStore([...ordersStore, newOrder]);

    return newOrder;
  },
  updateOne: async (orderId, data) => {
    // Simulate loading delay
    await new Promise((resolve) => {
      setTimeout(resolve, 750);
    });

    const ordersStore = getOrdersStore();

    let updatedOrder: Order | null = null;

    setOrdersStore(
      ordersStore.map((order) => {
        if (order.id === Number(orderId)) {
          updatedOrder = { ...order, ...data };
          return updatedOrder;
        }
        return order;
      }),
    );

    if (!updatedOrder) {
      throw new Error('Order not found');
    }
    return updatedOrder;
  },
  deleteOne: async (orderId) => {
    // Simulate loading delay
    await new Promise((resolve) => {
      setTimeout(resolve, 750);
    });

    const ordersStore = getOrdersStore();

    setOrdersStore(ordersStore.filter((order) => order.id !== Number(orderId)));
  },
  validate: z.object({
    title: z.string({ required_error: 'Title is required' }).nonempty('Title is required'),
    description: z.string().optional(),
    status: z.enum(['pending', 'sent'], {
      errorMap: () => ({ message: 'Status must be "Pending" or "Sent"' }),
    }),
    itemCount: z
      .number({ required_error: 'Item count is required' })
      .min(1, 'Item count must be at least 1'),
    fastDelivery: z.boolean({ required_error: 'Fast delivery is required' }),
    createdAt: z
      .string({ required_error: 'Creation date is required' })
      .nonempty('Creation date is required'),
    deliveryTime: z.string().optional(),
  })['~standard'].validate,
};

export const ordersCache = new DataSourceCache();
