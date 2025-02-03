import * as React from 'react';
import { CRUD } from '@toolpad/core/CRUD';
import { ordersDataSource, Order } from '../data/orders';

export default function OrdersCRUDPage() {
  return (
    <CRUD<Order>
      dataSource={ordersDataSource}
      rootPath="/orders"
      initialPageSize={25}
      defaultValues={{ itemCount: 1 }}
    />
  );
}
