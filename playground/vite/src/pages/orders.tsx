import * as React from 'react';
import { List } from '@toolpad/core/List';

interface Order extends Record<string, unknown> {
  id: number;
  name: string;
}

const orderFields = [
  { field: 'id', headerName: 'ID' },
  { field: 'name', headerName: 'Name' },
  { field: 'status', headerName: 'Status' },
];

export default function OrdersPage() {
  return (
    <List<Order>
      fields={orderFields}
      methods={{
        getMany: async ({ paginationModel }) => {
          return new Promise<{ items: Order[]; itemCount: number }>((resolve) => {
            setTimeout(() => {
              resolve({
                items: Array.from({ length: paginationModel.pageSize }, (_, i) => ({
                  id: paginationModel.page * paginationModel.pageSize + i + 1,
                  name: `Order ${paginationModel.page * paginationModel.pageSize + i + 1}`,
                })).slice(0, paginationModel.pageSize),
                itemCount: 300,
              });
            }, 1500);
          });
        },
      }}
      initialPageSize={0}
    />
  );
}
