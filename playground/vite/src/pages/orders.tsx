import * as React from 'react';
import { CRUD } from '@toolpad/core/CRUD';
import { ordersDataSource, Order } from '../data/orders';

export default function OrdersPage() {
  return (
    <CRUD<Order>
      dataSource={ordersDataSource}
      list="/orders"
      show="/orders/:id"
      create="/orders/new"
      edit="/orders/:id/edit"
      initialPageSize={25}
      initialValues={{ itemCount: 0 }}
    />
  );
}
