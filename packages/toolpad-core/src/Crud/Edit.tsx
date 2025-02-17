'use client';
import * as React from 'react';
import PropTypes from 'prop-types';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import invariant from 'invariant';
import { useNotifications } from '../useNotifications';
import { CrudContext } from '../shared/context';
import { CrudForm } from './CrudForm';
import { DataModel, DataModelId, DataSource, OmitId } from './shared';

interface EditFormProps<D extends DataModel> {
  dataSource: DataSource<D> & Required<Pick<DataSource<D>, 'getOne' | 'updateOne'>>;
  initialValues: Partial<OmitId<D>>;
  onSubmit: (formValues: Partial<OmitId<D>>) => void | Promise<void>;
  onSubmitSuccess?: (formValues: Partial<OmitId<D>>) => void | Promise<void>;
}

function EditForm<D extends DataModel>(props: EditFormProps<D>) {
  const { dataSource, initialValues, onSubmit, onSubmitSuccess } = props;
  const { fields, validate } = dataSource;

  const notifications = useNotifications();

  const [formState, setFormState] = React.useState<{
    values: Partial<OmitId<D>>;
    errors: Partial<Record<keyof D, string>>;
  }>({
    values: {
      ...Object.fromEntries(
        fields
          .filter(({ field }) => field !== 'id')
          .map(({ field, type }) => [
            field,
            type === 'boolean' ? (initialValues[field] ?? false) : initialValues[field],
          ]),
      ),
      ...initialValues,
    },
    errors: {},
  });
  const formValues = formState.values;
  const formErrors = formState.errors;

  const setFormValues = React.useCallback((newFormValues: Partial<OmitId<D>>) => {
    setFormState((previousState) => ({
      ...previousState,
      values: newFormValues,
    }));
  }, []);

  const setFormErrors = React.useCallback((newFormErrors: Partial<Record<keyof D, string>>) => {
    setFormState((previousState) => ({
      ...previousState,
      errors: newFormErrors,
    }));
  }, []);

  const handleFormFieldChange = React.useCallback(
    (name: keyof D, value: string | number | boolean | File | null) => {
      const validateField = async (values: Partial<OmitId<D>>) => {
        if (validate) {
          const errors = await validate(values);
          setFormErrors({ ...formErrors, [name]: errors[name] });
        }
      };

      const newFormValues = { ...formValues, [name]: value };

      setFormValues(newFormValues);
      validateField(newFormValues);
    },
    [formErrors, formValues, setFormErrors, setFormValues, validate],
  );

  const handleFormReset = React.useCallback(() => {
    setFormValues(initialValues);
  }, [initialValues, setFormValues]);

  const handleFormSubmit = React.useCallback(async () => {
    if (validate) {
      const errors = await validate(formValues);
      if (Object.keys(errors).length > 0) {
        setFormErrors(errors);
        throw new Error('Form validation failed');
      }
    }
    setFormErrors({});

    try {
      await onSubmit(formValues);
      notifications.show('Item edited successfully.', {
        severity: 'success',
        autoHideDuration: 3000,
      });

      if (onSubmitSuccess) {
        await onSubmitSuccess(formValues);
      }
    } catch (editError) {
      notifications.show(`Failed to edit item.\n${(editError as Error).message}`, {
        severity: 'error',
        autoHideDuration: 3000,
      });
      throw editError;
    }
  }, [formValues, notifications, onSubmit, onSubmitSuccess, setFormErrors, validate]);

  return (
    <CrudForm
      dataSource={dataSource}
      formState={formState}
      onFieldChange={handleFormFieldChange}
      onSubmit={handleFormSubmit}
      onReset={handleFormReset}
      localeText={{
        submitButtonLabel: 'Edit',
      }}
    />
  );
}

EditForm.propTypes /* remove-proptypes */ = {
  // ┌────────────────────────────── Warning ──────────────────────────────┐
  // │ These PropTypes are generated from the TypeScript type definitions. │
  // │ To update them, edit the TypeScript types and run `pnpm proptypes`. │
  // └─────────────────────────────────────────────────────────────────────┘
  dataSource: PropTypes.object.isRequired,
  initialValues: PropTypes.object.isRequired,
  onSubmit: PropTypes.func.isRequired,
  onSubmitSuccess: PropTypes.func,
} as any;

export interface EditProps<D extends DataModel> {
  id: DataModelId;
  /**
   * Server-side data source.
   */
  dataSource?: DataSource<D> & Required<Pick<DataSource<D>, 'getOne' | 'updateOne'>>;
  /**
   * Callback fired when the form is successfully submitted.
   */
  onSubmitSuccess?: (formValues: Partial<OmitId<D>>) => void | Promise<void>;
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
  const { id, onSubmitSuccess } = props;

  const crudContext = React.useContext(CrudContext);
  const dataSource = (props.dataSource ?? crudContext.dataSource) as Exclude<
    typeof props.dataSource,
    undefined
  >;

  invariant(dataSource, 'No data source found.');

  const { fields, validate, ...methods } = dataSource;
  const { getOne, updateOne } = methods;

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

  const handleSubmit = React.useCallback(
    async (formValues: Partial<OmitId<D>>) => {
      const updatedData = await updateOne(id, formValues);
      setData(updatedData);
    },
    [id, updateOne],
  );

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
      <EditForm
        dataSource={dataSource}
        initialValues={data}
        onSubmit={handleSubmit}
        onSubmitSuccess={onSubmitSuccess}
      />
    ) : null;
  }, [data, dataSource, error, handleSubmit, isLoading, onSubmitSuccess]);

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
} as any;

export { Edit };
