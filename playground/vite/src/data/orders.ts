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
      valueGetter: (value: string) => new Date(value),
    },
    {
      field: 'deliveryTime',
      headerName: 'Delivery time',
      type: 'dateTime',
      valueGetter: (value: string) => new Date(value),
    },
  ],
  getMany: async ({ paginationModel }) => {
    return new Promise<{ items: Order[]; itemCount: number }>((resolve) => {
      setTimeout(() => {
        resolve({
          items: Array.from({ length: paginationModel.pageSize }, (_, i) => ({
            id: paginationModel.page * paginationModel.pageSize + i + 1,
            title: `Order ${paginationModel.page * paginationModel.pageSize + i + 1}`,
            status: 'pending' as OrderStatus,
            itemCount: 3,
            fastDelivery: true,
            createdAt: new Date().toISOString(),
            deliveryTime: new Date().toISOString(),
          })).slice(0, paginationModel.pageSize),
          itemCount: 300,
        });
      }, 1500);
    });
  },
  getOne: (orderId) => {
    return new Promise<Order>((resolve) => {
      setTimeout(() => {
        return orderId
          ? resolve({
              id: Number(orderId),
              title: `Order ${orderId}`,
              status: 'pending',
              itemCount: 3,
              fastDelivery: true,
              createdAt: new Date().toISOString(),
              deliveryTime: new Date().toISOString(),
            })
          : null;
      }, 1500);
    });
  },
  createOne: (data) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ id: 999, ...data } as Order);
      }, 1500);
    });
  },
  updateOne: (data) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(data);
      }, 1500);
    });
  },
  deleteOne: () => {
    return new Promise<void>((resolve) => {
      setTimeout(() => {
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
