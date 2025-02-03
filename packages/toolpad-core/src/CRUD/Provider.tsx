'use client';
import * as React from 'react';
import { DataModel, DataSource } from './shared';
import { CRUDContext } from '../shared/context';

export interface ProviderProps<D extends DataModel> {
  /**
   * Server-side data source.
   */
  dataSource: DataSource<D>;
  children?: React.ReactNode;
}

function Provider<D extends DataModel>(props: ProviderProps<D>) {
  const { dataSource, children } = props;

  return <CRUDContext value={{ dataSource } as ProviderProps<DataModel>}>{children}</CRUDContext>;
}

export { Provider };
