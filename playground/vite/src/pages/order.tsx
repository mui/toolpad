import * as React from 'react';
import { Show } from '@toolpad/core/CRUD';
import { useParams } from 'react-router-dom';

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
  const { orderId } = useParams();

  return orderId ? (
    <Show<Order>
      id={orderId}
      fields={orderFields}
      methods={{
        getOne: () => {
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
      }}
    />
  ) : null;
}
