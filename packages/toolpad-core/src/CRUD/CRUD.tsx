'use client';
import * as React from 'react';
import { DataModel, DataSource } from './shared';
import { CRUDContext } from '../shared/context';

export interface CRUDProps<D extends DataModel> {
  /**
   * Server-side data source.
   */
  dataSource: DataSource<D>;
  children?: React.ReactNode;
}

function CRUD<D extends DataModel>(props: CRUDProps<D>) {
  const { dataSource, children } = props;

  return <CRUDContext value={{ dataSource } as CRUDProps<DataModel>}>{children}</CRUDContext>;
}

export { CRUD };
