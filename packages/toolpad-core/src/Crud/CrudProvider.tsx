'use client';
import * as React from 'react';
import PropTypes from 'prop-types';
import { CrudContext } from '../shared/context';
import type { DataModel, DataSource } from './types';

export interface CrudProviderProps<D extends DataModel> {
  /**
   * Server-side data source.
   */
  dataSource: DataSource<D>;
  children?: React.ReactNode;
}
/**
 *
 * Demos:
 *
 * - [Crud](https://mui.com/toolpad/core/react-crud/)
 *
 * API:
 *
 * - [CrudProvider API](https://mui.com/toolpad/core/api/crud-provider)
 */
function CrudProvider<D extends DataModel>(props: CrudProviderProps<D>) {
  const { dataSource, children } = props;

  return (
    <CrudContext value={{ dataSource } as CrudProviderProps<DataModel>}>{children}</CrudContext>
  );
}

CrudProvider.propTypes /* remove-proptypes */ = {
  // ┌────────────────────────────── Warning ──────────────────────────────┐
  // │ These PropTypes are generated from the TypeScript type definitions. │
  // │ To update them, edit the TypeScript types and run `pnpm proptypes`. │
  // └─────────────────────────────────────────────────────────────────────┘
  /**
   * @ignore
   */
  children: PropTypes.node,
  /**
   * Server-side data source.
   */
  dataSource: PropTypes.object.isRequired,
} as any;

export { CrudProvider };
