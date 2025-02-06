import * as React from 'react';
import PropTypes from 'prop-types';
import { createTheme } from '@mui/material/styles';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { AppProvider } from '@toolpad/core/AppProvider';
import { DashboardLayout } from '@toolpad/core/DashboardLayout';
import { PageContainer } from '@toolpad/core/PageContainer';
import { CRUD } from '@toolpad/core/CRUD';
import { useDemoRouter } from '@toolpad/core/internal';

const NAVIGATION = [
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

let ordersStore = [];

export const ordersDataSource = {
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
      valueGetter: (value) => value && new Date(value),
    },
    {
      field: 'deliveryTime',
      headerName: 'Delivery time',
      type: 'dateTime',
      valueGetter: (value) => value && new Date(value),
    },
  ],
  getMany: async ({ paginationModel, filterModel, sortModel }) => {
    return new Promise((resolve) => {
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
                  return orderValue > value;
                case '<':
                  return orderValue < value;
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
              if (a[field] < b[field]) {
                return sort === 'asc' ? -1 : 1;
              }
              if (a[field] > b[field]) {
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
    return new Promise((resolve, reject) => {
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
        const newOrder = { id: ordersStore.length + 1, ...data };

        ordersStore = [...ordersStore, newOrder];

        resolve(newOrder);
      }, 1500);
    });
  },
  updateOne: (orderId, data) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        let updatedOrder = null;

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
    return new Promise((resolve) => {
      setTimeout(() => {
        ordersStore = ordersStore.filter((order) => order.id !== id);

        resolve();
      }, 1500);
    });
  },
  validate: (formValues) => {
    const errors = {};

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

function CRUDBasic(props) {
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
          <CRUD
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

CRUDBasic.propTypes = {
  /**
   * Injected by the documentation to work in an iframe.
   * Remove this when copying and pasting into your project.
   */
  window: PropTypes.func,
};

export default CRUDBasic;
