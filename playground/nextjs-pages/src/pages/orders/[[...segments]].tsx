import * as React from 'react';
import { Crud } from '@toolpad/core/Crud';
import { ordersDataSource, Order } from '../../data/orders';

export default function OrdersCrudPage() {
  return (
    <Crud<Order>
      dataSource={ordersDataSource}
      rootPath="/orders"
      initialPageSize={25}
      defaultValues={{ itemCount: 1 }}
    />
  );
}
