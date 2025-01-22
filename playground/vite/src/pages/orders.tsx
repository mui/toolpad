import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { List } from '@toolpad/core/CRUD';
import ordersDataSource, { Order } from '../data/orders';

export default function OrdersPage() {
  const navigate = useNavigate();

  const handleRowClick = React.useCallback(
    (id: string | number) => {
      navigate(`/orders/${String(id)}`);
    },
    [navigate],
  );

  const handleCreateClick = React.useCallback(() => {
    navigate('/orders/new');
  }, [navigate]);

  return (
    <List<Order>
      dataSource={ordersDataSource}
      initialPageSize={25}
      onRowClick={handleRowClick}
      onCreateClick={handleCreateClick}
      onEditClick={() => {}}
    />
  );
}
