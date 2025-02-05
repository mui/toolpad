'use client';
import * as React from 'react';
import PropTypes from 'prop-types';
import invariant from 'invariant';
import { FormPage } from './FormPage';
import { DataModel, DataSource } from './shared';
import { CRUDContext } from '../shared/context';

export interface CreateProps<D extends DataModel> {
  /**
   * Server-side data source.
   */
  dataSource?: DataSource<D> & Required<Pick<DataSource<D>, 'createOne'>>;
  /**
   * Initial form values.
   */
  initialValues?: Omit<D, 'id'>;
  /**
   * Callback fired when the form is successfully submitted.
   */
  onSubmitSuccess?: () => void;
}
/**
 *
 * Demos:
 *
 * - [CRUD](https://mui.com/toolpad/core/react-crud/)
 *
 * API:
 *
 * - [Create API](https://mui.com/toolpad/core/api/create)
 */
function Create<D extends DataModel>(props: CreateProps<D>) {
  const { initialValues, onSubmitSuccess } = props;

  const crudContext = React.useContext(CRUDContext);
  const dataSource = (props.dataSource ?? crudContext.dataSource) as Exclude<
    typeof props.dataSource,
    undefined
  >;

  invariant(dataSource, 'No data source found.');

  return (
    <FormPage
      dataSource={dataSource}
      initialValues={initialValues}
      submitMethodName="createOne"
      onSubmitSuccess={onSubmitSuccess}
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
   */
  initialValues: PropTypes.object,
  /**
   * Callback fired when the form is successfully submitted.
   */
  onSubmitSuccess: PropTypes.func,
} as any;

export { Create };
