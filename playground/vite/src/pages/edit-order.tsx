import * as React from 'react';
import { Edit } from '@toolpad/core/CRUD';
import { useNavigate, useParams } from 'react-router';
import { ordersDataSource, Order } from '../data/orders';

export default function EditOrderPage() {
  const navigate = useNavigate();
  const { orderId } = useParams();

  const handleEdit = React.useCallback(() => {
    navigate('/orders');
  }, [navigate]);

  return orderId ? (
    <Edit<Order> id={orderId} dataSource={ordersDataSource} onSubmitSuccess={handleEdit} />
  ) : null;
}
