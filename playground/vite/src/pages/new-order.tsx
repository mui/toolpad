import * as React from 'react';
import { Create } from '@toolpad/core/CRUD';
import ordersDataSource, { Order } from '../data/orders';

export default function OrderPage() {
  return <Create<Order> dataSource={ordersDataSource} />;
}
