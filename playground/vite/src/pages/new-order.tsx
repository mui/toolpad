import * as React from 'react';
import { Create, Form } from '@toolpad/core/CRUD';
import ordersDataSource, { Order } from '../data/orders';

const initialFormValues = { name: '' };

export default function OrderPage() {
  const [formValues, setFormValues] = React.useState(initialFormValues);

  const form: Form<Order> = React.useMemo(
    () => ({
      value: formValues,
      onChange: (name, value) => {
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
