import * as React from 'react';
import { Create } from '@toolpad/core/CRUD';
import { useNavigate } from 'react-router';
import { ordersDataSource, Order } from '../data/orders';

export default function NewOrderPage() {
  const navigate = useNavigate();

  const handleCreate = React.useCallback(() => {
    navigate('/orders');
  }, [navigate]);

  return (
    <Create<Order>
      dataSource={ordersDataSource}
      initialValues={{ itemCount: 0 }}
      onSubmitSuccess={handleCreate}
    />
  );
}
