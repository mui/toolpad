import { DataModel } from '@toolpad/core/CRUD';
import * as yup from 'yup';

const yupAdapter =
  <D extends DataModel>(schema: yup.ObjectSchema<Omit<D, 'id'>>) =>
  async (formValues: Omit<D, 'id'>) => {
    try {
      await schema.validate(formValues, { abortEarly: false });
      return {};
    } catch (error) {
      return (error as yup.ValidationError).inner.reduce(
        (acc, curr) => {
          if (curr.path) {
            acc[curr.path as keyof Omit<D, 'id'>] = curr.message;
          }
          return acc;
        },
        {} as Record<keyof Omit<D, 'id'>, string>,
      );
    }
  };

export default yupAdapter;
