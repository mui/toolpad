'use client';
import * as React from 'react';
import PropTypes from 'prop-types';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import invariant from 'invariant';
import { FormPage } from './FormPage';
import { DataModel, DataModelId, DataSource } from './shared';
import { CRUDContext } from '../shared/context';

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
}

function Edit<D extends DataModel>(props: EditProps<D>) {
  const { id, onSubmitSuccess } = props;

  const crudContext = React.useContext(CRUDContext);
  const dataSource = (props.dataSource ?? crudContext.dataSource) as Exclude<
    typeof props.dataSource,
    undefined
  >;
  invariant(dataSource, 'No data source found.');

  const { fields, ...methods } = dataSource;
  const { getOne } = methods;

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
      <FormPage
        dataSource={dataSource}
        initialValues={data}
        submitMethodName="updateOne"
        onSubmitSuccess={onSubmitSuccess}
        localeText={{
          submitButtonLabel: 'Edit',
          submitSuccessMessage: 'Item edited successfully.',
          submitErrorMessage: 'Failed to edit item.',
        }}
      />
    ) : null;
  }, [data, dataSource, error, isLoading, onSubmitSuccess]);

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
  dataSource: PropTypes.object.isRequired,
  /**
   * @ignore
   */
  id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
} as any;

export { Edit };
