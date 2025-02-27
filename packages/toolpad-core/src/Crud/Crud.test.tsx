/**
 * @vitest-environment jsdom
 */

import * as React from 'react';
import { expect, describe, test, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { AppProvider } from '../AppProvider';
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

let ordersStore: Order[] = [
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
    title: 'Order 2',
    description: 'I am the third order',
    status: 'Pending',
    itemCount: 3,
    fastDelivery: true,
    createdAt: new Date().toISOString(),
  },
];

export const ordersDataSource: DataSource<Order> = {
  fields: [
    { field: 'id', headerName: 'ID' },
    { field: 'title', headerName: 'Title' },
    { field: 'description', headerName: 'Description', type: 'longString' },
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
  getMany: async ({ paginationModel }) => {
    return new Promise<{ items: Order[]; itemCount: number }>((resolve) => {
      setTimeout(() => {
        // Apply pagination
        const start = paginationModel.page * paginationModel.pageSize;
        const end = start + paginationModel.pageSize;
        const paginatedOrders = ordersStore.slice(start, end);

        resolve({
          items: paginatedOrders,
          itemCount: ordersStore.length,
        });
      }, 1500);
    });
  },
  getOne: (orderId) => {
    return new Promise<Order>((resolve, reject) => {
      setTimeout(() => {
        const orderToShow = ordersStore.find((order) => order.id === Number(orderId));

        if (orderToShow) {
          resolve(orderToShow);
        } else {
          reject(new Error('Order not found'));
        }
      }, 1500);
    });
  },
  createOne: (data) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newOrder = { id: ordersStore.length + 1, ...data } as Order;

        ordersStore = [...ordersStore, newOrder];

        resolve(newOrder);
      }, 1500);
    });
  },
  updateOne: (orderId, data) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        let updatedOrder: Order | null = null;

        ordersStore = ordersStore.map((order) => {
          if (order.id === Number(orderId)) {
            updatedOrder = { ...order, ...data };
            return updatedOrder;
          }
          return order;
        });

        if (updatedOrder) {
          resolve(updatedOrder);
        } else {
          reject(new Error('Order not found'));
        }
      }, 1500);
    });
  },
  deleteOne: (orderId) => {
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        ordersStore = ordersStore.filter((order) => order.id !== Number(orderId));

        resolve();
      }, 1500);
    });
  },
  validate: (formValues) => {
    const errors: Record<keyof Order, string> = {};

    if (!formValues.title) {
      errors.title = 'Title is required';
    }
    if (formValues.title && formValues.title.length < 3) {
      errors.title = 'Title must be at least 3 characters long';
    }
    if (!formValues.description) {
      errors.description = 'Description is required';
    }

    return errors;
  },
};

describe('Crud', () => {
  test('renders list items correctly', async () => {
    const router = { pathname: '/orders', searchParams: new URLSearchParams(), navigate: vi.fn() };

    render(
      <AppProvider navigation={[{ segment: 'orders', title: 'Orders' }]} router={router}>
        <Crud
          dataSource={ordersDataSource}
          rootPath="/orders"
          defaultValues={{ title: 'New order' }}
        />
      </AppProvider>,
    );

    expect(screen.getByText('Order 1')).toBeTruthy();
  });
});
