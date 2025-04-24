import * as React from 'react';
import { useRouter } from 'next/router';
import { Crud } from '@toolpad/core/Crud';
import { ordersDataSource, Order, ordersCache } from '../../data/orders';

export default function OrdersCrudPage() {
  const router = useRouter();

  return router.isReady ? (
    <Crud<Order>
      dataSource={ordersDataSource}
      dataSourceCache={ordersCache}
      rootPath="/orders"
      initialPageSize={25}
      defaultValues={{ itemCount: 1 }}
    />
  ) : null;
}
