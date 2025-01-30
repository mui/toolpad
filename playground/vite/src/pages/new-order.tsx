import * as React from 'react';
import { Create } from '@toolpad/core/CRUD';
import * as yup from 'yup';
import ordersDataSource, { Order } from '../data/orders';

const orderSchema = yup.object({
  name: yup.string().required('Name is required'),
  status: yup.string().required('Status is required'),
  itemCount: yup.number().min(1, 'Item count must be at least 1'),
});

export default function OrderPage() {
  const validate = React.useCallback(async (formValues: Omit<Order, 'id'>) => {
    try {
      await orderSchema.validate(formValues, { abortEarly: false });
      return {};
    } catch (error) {
      return (error as yup.ValidationError).inner.reduce(
        (acc, curr) => {
          if (curr.path) {
            acc[curr.path] = curr.message;
          }
          return acc;
        },
        {} as Record<keyof Order, string>,
      );
    }
  }, []);

  return (
    <Create<Order>
      dataSource={ordersDataSource}
      initialValues={{ itemCount: 0 }}
      validate={validate}
    />
  );
}
