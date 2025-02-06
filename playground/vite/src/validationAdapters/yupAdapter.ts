import { DataModel, DataSource, OmitId } from '@toolpad/core/CRUD';
import * as yup from 'yup';

const yupAdapter =
  <D extends DataModel>(schema: yup.ObjectSchema<OmitId<D>>): DataSource<D>['validate'] =>
  async (formValues) => {
    try {
      await schema.validate(formValues, { abortEarly: false });
      return {};
    } catch (error) {
      return (error as yup.ValidationError).inner.reduce(
        (acc, curr) => {
          if (curr.path) {
            acc[curr.path as keyof OmitId<D>] = curr.message;
          }
          return acc;
        },
        {} as Record<keyof OmitId<D>, string>,
      );
    }
  };

export default yupAdapter;
