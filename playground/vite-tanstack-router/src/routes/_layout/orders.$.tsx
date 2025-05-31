import * as React from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { Crud } from '@toolpad/core/Crud';
import { ordersDataSource, Order, ordersCache } from '../../data/orders';

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

export const Route = createFileRoute('/_layout/orders/$')({
  component: OrdersCrudPage,
});
