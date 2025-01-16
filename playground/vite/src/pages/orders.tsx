import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { List } from '@toolpad/core/CRUD';

interface Order extends Record<string, unknown> {
  id: number;
  name: string;
  status: string;
}

const orderFields = [
  { field: 'id', headerName: 'ID' },
  { field: 'name', headerName: 'Name' },
  { field: 'status', headerName: 'Status' },
];

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
      fields={orderFields}
      methods={{
        getMany: async ({ paginationModel }) => {
          return new Promise<{ items: Order[]; itemCount: number }>((resolve) => {
            setTimeout(() => {
              resolve({
                items: Array.from({ length: paginationModel.pageSize }, (_, i) => ({
                  id: paginationModel.page * paginationModel.pageSize + i + 1,
                  name: `Order ${paginationModel.page * paginationModel.pageSize + i + 1}`,
                  status: 'pending',
                })).slice(0, paginationModel.pageSize),
                itemCount: 300,
              });
            }, 1500);
          });
        },
        deleteOne: () => {
          return new Promise<void>((resolve) => {
            setTimeout(() => {
              resolve();
            }, 1500);
          });
        },
      }}
      initialPageSize={25}
      onRowClick={handleRowClick}
      onCreateClick={handleCreateClick}
      onEditClick={() => {}}
    />
  );
}
