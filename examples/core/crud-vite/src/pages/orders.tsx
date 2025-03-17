import * as React from 'react';
import { Crud } from '@toolpad/core/Crud';
import { ordersDataSource, Order, ordersCache } from '../data/orders';

export default function OrdersCrudPage() {
  return (
    <Crud<Order>
      dataSource={ordersDataSource}
      dataSourceCache={ordersCache}
      rootPath="/orders"
      initialPageSize={25}
      defaultValues={{ itemCount: 1 }}
    />
  );
}
