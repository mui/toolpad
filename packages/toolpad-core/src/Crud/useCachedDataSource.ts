import * as React from 'react';
import { DataSourceCache } from './cache';
import type { DataModel, DataSource } from './types';

function useCachedDataSource<D extends DataModel>(
  dataSource: DataSource<D>,
  cache: DataSourceCache,
): DataSource<D> {
  return React.useMemo(() => {
    const { getMany, getOne, createOne, updateOne, deleteOne, ...rest } = dataSource;

    return {
      ...Object.fromEntries(
        Object.entries({ getMany, getOne })
          .filter(([_key, method]) => !!method)
          .map(([key, method]) => [
            key,
            async (...args: unknown[]) => {
              const cacheKey = JSON.stringify([key, ...args]);

              const cacheValue = cache.get(cacheKey);

              if (cacheValue) {
                return cacheValue;
              }

              const result = await (
                method as (
                  ...args: unknown[]
                ) =>
                  | ReturnType<NonNullable<DataSource<D>['getMany']>>
                  | ReturnType<NonNullable<DataSource<D>['getOne']>>
              )(...args);

              cache.set(cacheKey, result);
              return result;
            },
          ]),
      ),
      ...Object.fromEntries(
        Object.entries({ createOne, updateOne, deleteOne })
          .filter(([_key, method]) => !!method)
          .map(([key, method]) => [
            key,
            async (...args: unknown[]) => {
              const result = await (
                method as (
                  ...args: unknown[]
                ) =>
                  | ReturnType<NonNullable<DataSource<D>['createOne']>>
                  | ReturnType<NonNullable<DataSource<D>['updateOne']>>
                  | ReturnType<NonNullable<DataSource<D>['deleteOne']>>
              )(...args);

              cache.clear();
              return result;
            },
          ]),
      ),
      ...rest,
    };
  }, [cache, dataSource]);
}

export { useCachedDataSource };
