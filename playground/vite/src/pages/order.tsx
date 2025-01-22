import * as React from 'react';
import { Show } from '@toolpad/core/CRUD';
import { useNavigate, useParams } from 'react-router-dom';
import ordersDataSource, { Order } from '../data/orders';

export default function OrderPage() {
  const navigate = useNavigate();
  const { orderId } = useParams();

  const handleDelete = React.useCallback(() => {
    navigate('/orders');
  }, [navigate]);

  return orderId ? (
    <Show<Order>
      id={orderId}
      dataSource={ordersDataSource}
      onEditClick={() => {}}
      onDelete={handleDelete}
    />
  ) : null;
}
