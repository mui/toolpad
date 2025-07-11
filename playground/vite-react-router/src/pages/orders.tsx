import * as React from 'react';

import { Crud } from '@toolpad/core/Crud';
import { useParams } from 'react-router';
import { ordersDataSource, Order, ordersCache } from '../data/orders';

export default function OrdersCrudPage() {
  const { orderId } = useParams();

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
