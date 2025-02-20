'use client';
import { DataModel, DataSource, DataSourceCache } from '@toolpad/core/Crud';
import * as yup from 'yup';
import { getCookie, setCookie } from 'cookies-next';
import yupAdapter from '../validationAdapters/yupAdapter';

type OrderStatus = 'Pending' | 'Sent';

export interface Order extends DataModel {
  id: number;
  title: string;
  description?: string;
  status: OrderStatus;
  itemCount: number;
  fastDelivery: boolean;
  createdAt: string;
  deliveryTime?: string;
}

const getOrdersStore = async (): Promise<Order[]> => {
  const value = await getCookie('orders-store');
  return value ? JSON.parse(value) : [];
};

const setOrdersStore = async (value: Order[]) => {
  await setCookie('orders-store', JSON.stringify(value));
};

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
  getMany: async ({ paginationModel, filterModel, sortModel }) => {
    return new Promise<{ items: Order[]; itemCount: number }>((resolve) => {
      setTimeout(async () => {
        const ordersStore = await getOrdersStore();

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

        resolve({
          items: paginatedOrders,
          itemCount: filteredOrders.length,
        });
      }, 1500);
    });
  },
  getOne: (orderId) => {
    return new Promise<Order>((resolve, reject) => {
      setTimeout(async () => {
        const ordersStore = await getOrdersStore();

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
      setTimeout(async () => {
        const ordersStore = await getOrdersStore();

        const newOrder = { id: ordersStore.length + 1, ...data } as Order;

        setOrdersStore([...ordersStore, newOrder]);

        resolve(newOrder);
      }, 1500);
    });
  },
  updateOne: (orderId, data) => {
    return new Promise((resolve, reject) => {
      setTimeout(async () => {
        const ordersStore = await getOrdersStore();

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
      setTimeout(async () => {
        const ordersStore = await getOrdersStore();

        setOrdersStore(ordersStore.filter((order) => order.id !== Number(orderId)));

        resolve();
      }, 1500);
    });
  },
  validate: yupAdapter<Order>(
    yup.object({
      title: yup.string().required('Title is required'),
      description: yup.string(),
      status: yup
        .string()
        .oneOf(['Pending', 'Sent'], 'Status must be "Pending" or "Sent"')
        .required('Status is required'),
      itemCount: yup
        .number()
        .required('Item count is required')
        .min(1, 'Item count must be at least 1'),
      fastDelivery: yup.boolean().required('Fast delivery is required'),
      createdAt: yup.string().required('Creation date is required'),
      deliveryTime: yup.string(),
    }),
  ),
};

export const ordersCache = new DataSourceCache();
