import * as React from 'react';
import { createTheme } from '@mui/material/styles';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { AppProvider, type Navigation } from '@toolpad/core/AppProvider';
import { DashboardLayout } from '@toolpad/core/DashboardLayout';
import { PageContainer } from '@toolpad/core/PageContainer';
import { CRUD, DataModel, DataSource } from '@toolpad/core/CRUD';
import { useDemoRouter } from '@toolpad/core/internal';

const NAVIGATION: Navigation = [
  {
    segment: 'orders',
    title: 'Orders',
    icon: <ShoppingCartIcon />,
    pattern: 'orders{/:orderId}*',
  },
];

const demoTheme = createTheme({
  cssVariables: {
    colorSchemeSelector: 'data-toolpad-color-scheme',
  },
  colorSchemes: { light: true, dark: true },
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 600,
      lg: 1200,
      xl: 1536,
    },
  },
});

type OrderStatus = 'pending' | 'sent';

export interface Order extends DataModel {
  id: number;
  title: string;
  status: OrderStatus;
  itemCount: number;
  fastDelivery: boolean;
  createdAt: string;
  deliveryTime?: string;
}

let ordersStore: Order[] = [];

export const ordersDataSource: DataSource<Order> = {
  fields: [
    { field: 'id', headerName: 'ID' },
    { field: 'title', headerName: 'Title' },
    {
      field: 'status',
      headerName: 'Status',
      type: 'singleSelect',
      valueOptions: ['pending', 'sent'],
    },
    { field: 'itemCount', headerName: 'No. of items', type: 'number' },
    { field: 'fastDelivery', headerName: 'Fast delivery', type: 'boolean' },
    {
      field: 'createdAt',
      headerName: 'Created at',
      type: 'date',
      valueGetter: (value: string) => value && new Date(value),
    },
    {
      field: 'deliveryTime',
      headerName: 'Delivery time',
      type: 'dateTime',
      valueGetter: (value: string) => value && new Date(value),
    },
  ],
  getMany: async ({ paginationModel, filterModel, sortModel }) => {
    return new Promise<{ items: Order[]; itemCount: number }>((resolve) => {
      setTimeout(() => {
        let filteredOrders = [...ordersStore];

        // Apply filters
        if (filterModel?.items?.length) {
          filterModel.items.forEach(({ field, value, operator }) => {
            if (!field || value == null) {
              return;
            }

            filteredOrders = filteredOrders.filter((order) => {
              const orderValue = order[field];

              switch (operator) {
                case 'contains':
                  return String(orderValue)
                    .toLowerCase()
                    .includes(String(value).toLowerCase());
                case 'equals':
                  return orderValue === value;
                case 'startsWith':
                  return String(orderValue)
                    .toLowerCase()
                    .startsWith(String(value).toLowerCase());
                case 'endsWith':
                  return String(orderValue)
                    .toLowerCase()
                    .endsWith(String(value).toLowerCase());
                case '>':
                  return (orderValue as number) > value;
                case '<':
                  return (orderValue as number) < value;
                default:
                  return true;
              }
            });
          });
        }

        // Apply sorting
        if (sortModel?.length) {
          filteredOrders.sort((a, b) => {
            for (const { field, sort } of sortModel) {
              if ((a[field] as number) < (b[field] as number)) {
                return sort === 'asc' ? -1 : 1;
              }
              if ((a[field] as number) > (b[field] as number)) {
                return sort === 'asc' ? 1 : -1;
              }
            }
            return 0;
          });
        }

        // Apply pagination
        const start = paginationModel.page * paginationModel.pageSize;
        const end = start + paginationModel.pageSize;
        const paginatedOrders = filteredOrders.slice(start, end);

        resolve({
          items: paginatedOrders,
          itemCount: filteredOrders.length,
        });
      }, 1500);
    });
  },
  getOne: (orderId) => {
    return new Promise<Order>((resolve, reject) => {
      setTimeout(() => {
        const orderToShow = ordersStore.find(
          (order) => order.id === Number(orderId),
        );

        if (orderToShow) {
          resolve(orderToShow);
        } else {
          reject(new Error('Order not found'));
        }
      }, 1500);
    });
  },
  createOne: (data) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newOrder = { id: ordersStore.length + 1, ...data } as Order;

        ordersStore = [...ordersStore, newOrder];

        resolve(newOrder);
      }, 1500);
    });
  },
  updateOne: (orderId, data) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        let updatedOrder: Order | null = null;

        ordersStore = ordersStore.map((order) => {
          if (order.id === Number(orderId)) {
            updatedOrder = { ...order, ...data };
            return updatedOrder;
          }
          return order;
        });

        if (updatedOrder) {
          resolve(updatedOrder);
        } else {
          reject(new Error('Order not found'));
        }
      }, 1500);
    });
  },
  deleteOne: (id) => {
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        ordersStore = ordersStore.filter((order) => order.id !== id);

        resolve();
      }, 1500);
    });
  },
  validate: (formValues) => {
    const errors: Record<keyof Order, string> = {};

    if (!formValues.title) {
      errors.title = 'Title is required';
    }
    if (!formValues.status) {
      errors.status = 'Status is required';
    }
    if (!formValues.itemCount || formValues.itemCount < 1) {
      errors.itemCount = 'Item count must be at least 1';
    }
    if (!formValues.createdAt) {
      errors.createdAt = 'Creation date is required';
    }

    return errors;
  },
};

interface DemoProps {
  /**
   * Injected by the documentation to work in an iframe.
   * Remove this when copying and pasting into your project.
   */
  window?: () => Window;
}

export default function CRUDBasic(props: DemoProps) {
  const { window } = props;

  const router = useDemoRouter('/orders');

  // Remove this const when copying and pasting into your project.
  const demoWindow = window !== undefined ? window() : undefined;

  const title = React.useMemo(() => {
    return undefined;
  }, []);

  return (
    <AppProvider
      navigation={NAVIGATION}
      router={router}
      theme={demoTheme}
      window={demoWindow}
    >
      <DashboardLayout defaultSidebarCollapsed>
        <PageContainer title={title}>
          {/* preview-start */}
          <CRUD<Order>
            dataSource={ordersDataSource}
            rootPath="/orders"
            initialPageSize={25}
            defaultValues={{ itemCount: 1 }}
          />
          {/* preview-end */}
        </PageContainer>
      </DashboardLayout>
    </AppProvider>
  );
}
