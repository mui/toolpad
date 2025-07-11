import * as React from 'react';
import { createFileRoute, useParams } from '@tanstack/react-router';
import { Crud } from '@toolpad/core/Crud';
import { ordersDataSource, Order, ordersCache } from '../../data/orders';

export default function OrdersCrudPage() {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  const { _splat } = useParams({ strict: false });
  const orderId = _splat?.split('/')[0];

  return (
    <Crud<Order>
      dataSource={ordersDataSource}
      dataSourceCache={ordersCache}
      rootPath="/orders"
      initialPageSize={25}
      defaultValues={{ itemCount: 1 }}
      pageTitles={{
        show: `Order ${orderId}`,
        create: 'New Order',
        edit: `Order ${orderId} - Edit`,
      }}
    />
  );
}

export const Route = createFileRoute('/_layout/orders/$')({
  component: OrdersCrudPage,
});
