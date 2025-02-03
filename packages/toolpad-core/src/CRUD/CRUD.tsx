'use client';
import * as React from 'react';
import { match } from 'path-to-regexp';
import invariant from 'invariant';
import { DataModel, DataModelId, DataSource } from './shared';
import { Provider as CRUDProvider } from './Provider';
import { RouterContext } from '../shared/context';
import { List } from './List';
import { Show } from './Show';
import { Create } from './Create';
import { Edit } from './Edit';

export interface CRUDProps<D extends DataModel> {
  /**
   * Server-side data source.
   */
  dataSource: DataSource<D>;
  /**
   * Path to resource list page.
   */
  list: string;
  /**
   * Path to resource show page.
   */
  show: string;
  /**
   * Path to resource create page.
   */
  create: string;
  /**
   * Path to resource edit page.
   */
  edit: string;
  /**
   * Initial number of rows to show per page.
   * @default 100
   */
  initialPageSize?: number;
  /**
   * Initial form values.
   */
  initialValues?: Omit<D, 'id'>;
}

function CRUD<D extends DataModel>(props: CRUDProps<D>) {
  const { dataSource, list, show, create, edit, initialPageSize, initialValues } = props;

  const routerContext = React.useContext(RouterContext);

  const handleRowClick = React.useCallback(
    (id: string | number) => {
      routerContext?.navigate(`/orders/${String(id)}`);
    },
    [routerContext],
  );

  const handleCreateClick = React.useCallback(() => {
    routerContext?.navigate('/orders/new');
  }, [routerContext]);

  const handleEditClick = React.useCallback(
    (id: string | number) => {
      routerContext?.navigate(`/orders/${String(id)}/edit`);
    },
    [routerContext],
  );

  const handleCreate = React.useCallback(() => {
    routerContext?.navigate('/orders');
  }, [routerContext]);

  const handleEdit = React.useCallback(() => {
    routerContext?.navigate('/orders');
  }, [routerContext]);

  const handleDelete = React.useCallback(() => {
    routerContext?.navigate('/orders');
  }, [routerContext]);

  const renderedRoute = React.useMemo(() => {
    const pathname = routerContext?.pathname ?? '';

    if (match(list)(pathname)) {
      return (
        <List<D>
          initialPageSize={initialPageSize}
          onRowClick={handleRowClick}
          onCreateClick={handleCreateClick}
          onEditClick={handleEditClick}
        />
      );
    }
    const showMatch = match<{ id: DataModelId }>(show)(pathname);
    if (showMatch) {
      const resourceId = showMatch.params.id;
      invariant(resourceId, 'No resource ID present in URL.');
      return <Show<D> id={resourceId} onEditClick={handleEditClick} onDelete={handleDelete} />;
    }
    if (match(create)(pathname)) {
      return <Create<D> initialValues={initialValues} onSubmitSuccess={handleCreate} />;
    }
    const editMatch = match<{ id: DataModelId }>(edit)(pathname);
    if (editMatch) {
      const resourceId = editMatch.params.id;
      invariant(resourceId, 'No resource ID present in URL.');
      return <Edit<D> id={resourceId} onSubmitSuccess={handleEdit} />;
    }
    return null;
  }, [
    routerContext?.pathname,
    list,
    show,
    create,
    edit,
    initialPageSize,
    handleRowClick,
    handleCreateClick,
    handleEditClick,
    handleDelete,
    initialValues,
    handleCreate,
    handleEdit,
  ]);

  return <CRUDProvider<D> dataSource={dataSource}>{renderedRoute}</CRUDProvider>;
}

export { CRUD };
