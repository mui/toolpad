import * as React from 'react';
import { Create } from '@toolpad/core/CRUD';

interface Order extends Record<string, unknown> {
  id: number;
  name: string;
  status: string;
}

const orderFields = [
  { field: 'id', headerName: 'ID' },
  { field: 'name', headerName: 'Name' },
  { field: 'status', headerName: 'Status' },
];

export default function OrderPage() {
  return (
    <Create<Order>
      fields={orderFields}
      methods={{
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
      }}
    />
  );
}
