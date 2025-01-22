import { DataSource } from '@toolpad/core/CRUD';

export interface Order extends Record<string, unknown> {
  id: number;
  name: string;
  status: string;
}

const ordersDataSource: Required<DataSource<Order>> = {
  fields: [
    { field: 'id', headerName: 'ID' },
    { field: 'name', headerName: 'Name' },
    {
      field: 'status',
      headerName: 'Status',
      type: 'singleSelect',
      valueOptions: ['pending', 'fulfilled'],
    },
    { field: 'itemCount', headerName: 'No. of items', type: 'number' },
    { field: 'fulfilled', headerName: 'Fulfilled', type: 'boolean' },
    { field: 'deliveryDate', headerName: 'Delivery Date', type: 'date' },
    { field: 'deliveryTime', headerName: 'Delivery Time', type: 'dateTime' },
  ],
  getMany: async ({ paginationModel }) => {
    return new Promise<{ items: Order[]; itemCount: number }>((resolve) => {
      setTimeout(() => {
        resolve({
          items: Array.from({ length: paginationModel.pageSize }, (_, i) => ({
            id: paginationModel.page * paginationModel.pageSize + i + 1,
            name: `Order ${paginationModel.page * paginationModel.pageSize + i + 1}`,
            status: 'pending',
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
              name: `Order ${orderId}`,
              status: 'pending',
            })
          : null;
      }, 1500);
    });
  },
  createOne: () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          id: 69,
          name: 'Order 69',
          status: 'pending',
        });
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
};

export default ordersDataSource;
