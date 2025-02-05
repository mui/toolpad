'use client';
import * as React from 'react';
import PropTypes from 'prop-types';
import { DataModel, DataSource } from './shared';
import { CRUDContext } from '../shared/context';

export interface CRUDProviderProps<D extends DataModel> {
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
 * - [CRUD](https://mui.com/toolpad/core/react-crud/)
 *
 * API:
 *
 * - [CRUDProvider API](https://mui.com/toolpad/core/api/crud-provider)
 */
function CRUDProvider<D extends DataModel>(props: CRUDProviderProps<D>) {
  const { dataSource, children } = props;

  return (
    <CRUDContext value={{ dataSource } as CRUDProviderProps<DataModel>}>{children}</CRUDContext>
  );
}

CRUDProvider.propTypes /* remove-proptypes */ = {
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

export { CRUDProvider };
