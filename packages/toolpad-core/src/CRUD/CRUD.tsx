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

function CRUD(props: CRUDProps<DataModel>) {
  const { dataSource, children } = props;

  return <CRUDContext value={{ dataSource }}>{children}</CRUDContext>;
}

export { CRUD };
