'use client';
import * as React from 'react';
import PropTypes from 'prop-types';
import invariant from 'invariant';
import { CrudForm } from './CrudForm';
import { DataModel, DataSource, OmitId } from './shared';
import { CrudContext } from '../shared/context';

export interface CreateProps<D extends DataModel> {
  /**
   * Server-side data source.
   */
  dataSource?: DataSource<D> & Required<Pick<DataSource<D>, 'createOne'>>;
  /**
   * Initial form values.
   * @default {}
   */
  initialValues?: Partial<OmitId<D>>;
  /**
   * Callback fired when the form is successfully submitted.
   */
  onSubmitSuccess?: () => void;
  /**
   * Whether the form fields should reset after the form is submitted.
   */
  resetOnSubmit?: boolean;
}
/**
 *
 * Demos:
 *
 * - [Crud](https://mui.com/toolpad/core/react-crud/)
 *
 * API:
 *
 * - [Create API](https://mui.com/toolpad/core/api/create)
 */
function Create<D extends DataModel>(props: CreateProps<D>) {
  const { initialValues, onSubmitSuccess, resetOnSubmit } = props;

  const crudContext = React.useContext(CrudContext);
  const dataSource = (props.dataSource ?? crudContext.dataSource) as Exclude<
    typeof props.dataSource,
    undefined
  >;

  invariant(dataSource, 'No data source found.');

  const { createOne } = dataSource;

  const handleCreate = React.useCallback(
    async (formValues: Partial<OmitId<D>>) => {
      await createOne(formValues);
    },
    [createOne],
  );

  return (
    <CrudForm
      dataSource={dataSource}
      initialValues={initialValues}
      onSubmit={handleCreate}
      onSubmitSuccess={onSubmitSuccess}
      resetOnSubmit={resetOnSubmit}
      localeText={{
        submitButtonLabel: 'Create',
        submitSuccessMessage: 'Item created successfully.',
        submitErrorMessage: 'Failed to create item.',
      }}
    />
  );
}

Create.propTypes /* remove-proptypes */ = {
  // ┌────────────────────────────── Warning ──────────────────────────────┐
  // │ These PropTypes are generated from the TypeScript type definitions. │
  // │ To update them, edit the TypeScript types and run `pnpm proptypes`. │
  // └─────────────────────────────────────────────────────────────────────┘
  /**
   * Server-side data source.
   */
  dataSource: PropTypes.object,
  /**
   * Initial form values.
   * @default {}
   */
  initialValues: PropTypes.object,
  /**
   * Callback fired when the form is successfully submitted.
   */
  onSubmitSuccess: PropTypes.func,
  /**
   * Whether the form fields should reset after the form is submitted.
   */
  resetOnSubmit: PropTypes.bool,
} as any;

export { Create };
