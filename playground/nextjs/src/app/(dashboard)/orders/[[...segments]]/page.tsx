'use client';
import * as React from 'react';
import { Crud } from '@toolpad/core/Crud';
import { useParams } from 'next/navigation';
import { ordersDataSource, Order, ordersCache } from '../../../../data/orders';

export default function OrdersCrudPage() {
  const params = useParams();
  const [orderId] = params.segments ?? [];

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
