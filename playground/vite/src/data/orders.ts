import { DataSource } from '@toolpad/core/CRUD';
import * as yup from 'yup';
import yupAdapter from '../validationAdapters/yupAdapter';

type OrderStatus = 'pending' | 'sent';
export interface Order extends Record<string, unknown> {
  id: number;
  title: string;
  status: OrderStatus;
  itemCount: number;
  fastDelivery: boolean;
  createdAt: string;
  deliveryTime: string;
}

const getOrdersStore = (): Order[] => {
  const value = localStorage.getItem('orders-store');
  return value ? JSON.parse(value) : [];
};

const setOrdersStore = (value: Order[]) => {
  return localStorage.setItem('orders-store', JSON.stringify(value));
};

export const ordersDataSource: Required<DataSource<Order>> = {
  fields: [
    { field: 'id', headerName: 'ID' },
    { field: 'title', headerName: 'Title' },
    {
      field: 'status',
      headerName: 'Status',
      type: 'singleSelect',
      valueOptions: ['pending', 'fulfilled'],
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
      setTimeout(() => {
        const ordersStore = getOrdersStore();

        let filteredOrders = [...ordersStore];

        // Apply filters
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
      setTimeout(() => {
        const ordersStore = getOrdersStore();

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
        const ordersStore = getOrdersStore();

        const newOrder = { id: ordersStore.length + 1, ...data } as Order;

        setOrdersStore([...ordersStore, newOrder]);

        resolve(newOrder);
      }, 1500);
    });
  },
  updateOne: (data) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const ordersStore = getOrdersStore();

        let updatedOrder: Order | null = null;

        setOrdersStore(
          ordersStore.map((order) => {
            if (order.id === data.id) {
              updatedOrder = { ...order, ...data }; // Preserve existing fields
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
  deleteOne: (id) => {
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        const ordersStore = getOrdersStore();

        setOrdersStore(ordersStore.filter((order) => order.id !== id));

        resolve();
      }, 1500);
    });
  },
  validate: yupAdapter<Order>(
    yup.object({
      title: yup.string().required('Title is required'),
      status: yup.string().required('Status is required'),
      itemCount: yup.number().min(1, 'Item count must be at least 1'),
      createdAt: yup.string().required('Creation date is required'),
    }),
  ),
};
