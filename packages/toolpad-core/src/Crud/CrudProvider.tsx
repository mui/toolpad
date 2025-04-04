'use client';
import * as React from 'react';
import PropTypes from 'prop-types';
import { CrudContext } from '../shared/context';
import { DataSourceCache } from './cache';
import type { DataModel, DataSource } from './types';

export interface CrudProviderProps<D extends DataModel> {
  /**
   * Server-side [data source](https://mui.com/toolpad/core/react-crud/#data-sources).
   */
  dataSource: DataSource<D>;
  /**
   * [Cache](https://mui.com/toolpad/core/react-crud/#data-caching) for the data source.
   */
  dataSourceCache?: DataSourceCache | null;
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
 * - [CrudProvider API](https://mui.com/toolpad/core/api/crud-provider)
 */
function CrudProvider<D extends DataModel>(props: CrudProviderProps<D>) {
  const { dataSource, dataSourceCache, children } = props;

  const cache = React.useMemo(
    () => (typeof dataSourceCache !== 'undefined' ? dataSourceCache : new DataSourceCache()),
    [dataSourceCache],
  );

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
   * Server-side [data source](https://mui.com/toolpad/core/react-crud/#data-sources).
   */
  dataSource: PropTypes.object.isRequired,
  /**
   * [Cache](https://mui.com/toolpad/core/react-crud/#data-caching) for the data source.
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
