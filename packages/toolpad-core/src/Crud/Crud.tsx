'use client';
import * as React from 'react';
import PropTypes from 'prop-types';
import { match } from 'path-to-regexp';
import invariant from 'invariant';
import { RouterContext } from '../shared/context';
import { CrudProvider } from './CrudProvider';
import { List } from './List';
import { Show } from './Show';
import { Create } from './Create';
import { Edit } from './Edit';
import { DataSourceCache } from './cache';
import type { DataModel, DataModelId, DataSource, OmitId } from './types';

export interface CrudProps<D extends DataModel> {
  /**
   * Server-side [data source](https://mui.com/toolpad/core/react-crud/#data-sources).
   */
  dataSource: DataSource<D>;
  /**
   * Root path to CRUD pages.
   */
  rootPath: string;
  /**
   * Initial number of rows to show per page.
   * @default 100
   */
  initialPageSize?: number;
  /**
   * Default form values for a new item.
   * @default {}
   */
  defaultValues?: Partial<OmitId<D>>;
  /**
   * [Cache](https://mui.com/toolpad/core/react-crud/#data-caching) for the data source.
   */
  dataSourceCache?: DataSourceCache | null;
}
/**
 *
 * Demos:
 *
 * - [CRUD](https://mui.com/toolpad/core/react-crud/)
 *
 * API:
 *
 * - [Crud API](https://mui.com/toolpad/core/api/crud)
 */
function Crud<D extends DataModel>(props: CrudProps<D>) {
  const { dataSource, rootPath, initialPageSize, defaultValues, dataSourceCache } = props;

  const listPath = rootPath;
  const showPath = `${rootPath}/:id`;
  const createPath = `${rootPath}/new`;
  const editPath = `${rootPath}/:id/edit`;

  const routerContext = React.useContext(RouterContext);

  const handleRowClick = React.useCallback(
    (id: string | number) => {
      routerContext?.navigate(`${rootPath}/${String(id)}`);
    },
    [rootPath, routerContext],
  );

  const handleCreateClick = React.useCallback(() => {
    routerContext?.navigate(createPath);
  }, [createPath, routerContext]);

  const handleEditClick = React.useCallback(
    (id: string | number) => {
      routerContext?.navigate(`${rootPath}/${String(id)}/edit`);
    },
    [rootPath, routerContext],
  );

  const handleCreate = React.useCallback(() => {
    routerContext?.navigate(listPath);
  }, [listPath, routerContext]);

  const handleEdit = React.useCallback(() => {
    routerContext?.navigate(listPath);
  }, [listPath, routerContext]);

  const handleDelete = React.useCallback(() => {
    routerContext?.navigate(listPath);
  }, [listPath, routerContext]);

  const renderedRoute = React.useMemo(() => {
    const pathname = routerContext?.pathname ?? '';

    if (match(listPath)(pathname)) {
      return (
        <List<D>
          initialPageSize={initialPageSize}
          onRowClick={handleRowClick}
          onCreateClick={handleCreateClick}
          onEditClick={handleEditClick}
        />
      );
    }
    if (match(createPath)(pathname)) {
      return (
        <Create<D>
          initialValues={defaultValues}
          onSubmitSuccess={handleCreate}
          resetOnSubmit={false}
        />
      );
    }
    const showMatch = match<{ id: DataModelId }>(showPath)(pathname);
    if (showMatch) {
      const resourceId = showMatch.params.id;
      invariant(resourceId, 'No resource ID present in URL.');
      return <Show<D> id={resourceId} onEditClick={handleEditClick} onDelete={handleDelete} />;
    }
    const editMatch = match<{ id: DataModelId }>(editPath)(pathname);
    if (editMatch) {
      const resourceId = editMatch.params.id;
      invariant(resourceId, 'No resource ID present in URL.');
      return <Edit<D> id={resourceId} onSubmitSuccess={handleEdit} />;
    }
    return null;
  }, [
    routerContext?.pathname,
    listPath,
    createPath,
    showPath,
    editPath,
    initialPageSize,
    handleRowClick,
    handleCreateClick,
    handleEditClick,
    defaultValues,
    handleCreate,
    handleDelete,
    handleEdit,
  ]);

  return (
    <CrudProvider<D> dataSource={dataSource} dataSourceCache={dataSourceCache}>
      {renderedRoute}
    </CrudProvider>
  );
}

Crud.propTypes /* remove-proptypes */ = {
  // ┌────────────────────────────── Warning ──────────────────────────────┐
  // │ These PropTypes are generated from the TypeScript type definitions. │
  // │ To update them, edit the TypeScript types and run `pnpm proptypes`. │
  // └─────────────────────────────────────────────────────────────────────┘
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
  /**
   * Default form values for a new item.
   * @default {}
   */
  defaultValues: PropTypes.object,
  /**
   * Initial number of rows to show per page.
   * @default 100
   */
  initialPageSize: PropTypes.number,
  /**
   * Root path to CRUD pages.
   */
  rootPath: PropTypes.string.isRequired,
} as any;

export { Crud };
