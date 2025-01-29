import * as React from 'react';
import { Create } from '@toolpad/core/CRUD';
import ordersDataSource, { Order } from '../data/orders';

const initialFormValues = { name: '' };

export default function OrderPage() {
  const [formValues, setFormValues] = React.useState(initialFormValues);

  const form = React.useMemo(
    () => ({
      value: formValues,
      onChange: (name: string, value: string | number | boolean | File | null) => {
        setFormValues((previousFormValues) => ({
          ...previousFormValues,
          [name]: value,
        }));
      },
      onReset: () => {
        setFormValues(initialFormValues);
      },
    }),
    [formValues],
  );

  return <Create<Order> dataSource={ordersDataSource} form={form} />;
}
