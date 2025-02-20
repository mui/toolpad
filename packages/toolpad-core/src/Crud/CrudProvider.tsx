'use client';
import * as React from 'react';
import PropTypes from 'prop-types';
import { CrudContext } from '../shared/context';
import { DataSourceCache } from './cache';
import type { DataModel, DataSource } from './types';

export interface CrudProviderProps<D extends DataModel> {
  /**
   * Server-side data source.
   */
  dataSource: DataSource<D>;
  /**
   * Cache for the data source.
   */
  dataSourceCache?: DataSourceCache;
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
  const { dataSource, dataSourceCache, children } = props;

  const cache = React.useMemo(() => dataSourceCache ?? new DataSourceCache(), [dataSourceCache]);

  return (
    <CrudContext
      value={{
        dataSource: dataSource as CrudProviderProps<DataModel>['dataSource'],
        dataSourceCache: cache,
      }}
    >
      {children}
    </CrudContext>
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
  /**
   * Cache for the data source.
   */
  dataSourceCache: PropTypes.shape({
    cache: PropTypes.object.isRequired,
    clear: PropTypes.func.isRequired,
    get: PropTypes.func.isRequired,
    set: PropTypes.func.isRequired,
    ttl: PropTypes.number.isRequired,
  }),
} as any;

export { CrudProvider };
