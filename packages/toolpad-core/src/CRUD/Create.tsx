'use client';
import * as React from 'react';
import PropTypes from 'prop-types';
import { DataModel, DataSource } from './shared';
import { FormPage } from './FormPage';

export interface CreateProps<D extends DataModel> {
  /**
   * Server-side data source.
   */
  dataSource: DataSource<D> & Required<Pick<DataSource<D>, 'createOne'>>;
  /**
   * Initial form values.
   */
  initialValues: Omit<D, 'id'>;
  /**
   * Function to validate form values. Returns object with error strings for each field.
   */
  validate: (
    formValues: Omit<D, 'id'>,
  ) => Partial<Record<keyof D, string>> | Promise<Partial<Record<keyof D, string>>>;
}

function Create<D extends DataModel>(props: CreateProps<D>) {
  return (
    <FormPage
      {...props}
      submitMethodName="createOne"
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
  dataSource: PropTypes.object.isRequired,
} as any;

export { Create };
