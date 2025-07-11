import * as React from 'react';
import { useRouter } from 'next/router';
import { Crud } from '@toolpad/core/Crud';
import { ordersDataSource, Order, ordersCache } from '../../data/orders';

export default function OrdersCrudPage() {
  const router = useRouter();
  const { segments = [] } = router.query;
  const [orderId] = segments;

  return router.isReady ? (
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
  ) : null;
}
