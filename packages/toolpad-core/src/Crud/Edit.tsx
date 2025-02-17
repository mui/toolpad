'use client';
import * as React from 'react';
import PropTypes from 'prop-types';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import invariant from 'invariant';
import { CrudForm } from './CrudForm';
import { DataModel, DataModelId, DataSource, OmitId } from './shared';
import { CrudContext } from '../shared/context';

export interface EditProps<D extends DataModel> {
  id: DataModelId;
  /**
   * Server-side data source.
   */
  dataSource?: DataSource<D> & Required<Pick<DataSource<D>, 'getOne' | 'updateOne'>>;
  /**
   * Callback fired when the form is successfully submitted.
   */
  onSubmitSuccess?: () => void;
  /**
   * Whether the form fields should reset after the form is submitted.
   */
  resetOnSubmit?: boolean;
}
/**
 *
 * Demos:
 *
 * - [Crud](https://mui.com/toolpad/core/react-crud/)
 *
 * API:
 *
 * - [Edit API](https://mui.com/toolpad/core/api/edit)
 */
function Edit<D extends DataModel>(props: EditProps<D>) {
  const { id, onSubmitSuccess, resetOnSubmit } = props;

  const crudContext = React.useContext(CrudContext);
  const dataSource = (props.dataSource ?? crudContext.dataSource) as Exclude<
    typeof props.dataSource,
    undefined
  >;

  invariant(dataSource, 'No data source found.');

  const { fields, ...methods } = dataSource;
  const { getOne, updateOne } = methods;

  const handleEdit = React.useCallback(
    async (formValues: Partial<OmitId<D>>) => {
      await updateOne(id, formValues);
    },
    [id, updateOne],
  );

  const [data, setData] = React.useState<D | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);

  const loadData = React.useCallback(async () => {
    setError(null);
    setIsLoading(true);
    try {
      const showData = await getOne(id);
      setData(showData);
    } catch (showDataError) {
      setError(showDataError as Error);
    }
    setIsLoading(false);
  }, [getOne, id]);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  const renderEdit = React.useMemo(() => {
    if (isLoading) {
      return (
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            m: 1,
          }}
        >
          <CircularProgress />
        </Box>
      );
    }
    if (error) {
      return (
        <Box sx={{ flexGrow: 1 }}>
          <Alert severity="error">{error.message}</Alert>
        </Box>
      );
    }

    return data ? (
      <CrudForm
        dataSource={dataSource}
        initialValues={data}
        onSubmit={handleEdit}
        onSubmitSuccess={onSubmitSuccess}
        resetOnSubmit={resetOnSubmit}
        localeText={{
          submitButtonLabel: 'Edit',
          submitSuccessMessage: 'Item edited successfully.',
          submitErrorMessage: 'Failed to edit item.',
        }}
      />
    ) : null;
  }, [data, dataSource, error, handleEdit, isLoading, onSubmitSuccess, resetOnSubmit]);

  return <Box sx={{ display: 'flex', flex: 1 }}>{renderEdit}</Box>;
}

Edit.propTypes /* remove-proptypes */ = {
  // ┌────────────────────────────── Warning ──────────────────────────────┐
  // │ These PropTypes are generated from the TypeScript type definitions. │
  // │ To update them, edit the TypeScript types and run `pnpm proptypes`. │
  // └─────────────────────────────────────────────────────────────────────┘
  /**
   * Server-side data source.
   */
  dataSource: PropTypes.object,
  /**
   * @ignore
   */
  id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  /**
   * Callback fired when the form is successfully submitted.
   */
  onSubmitSuccess: PropTypes.func,
  /**
   * Whether the form fields should reset after the form is submitted.
   */
  resetOnSubmit: PropTypes.bool,
} as any;

export { Edit };
