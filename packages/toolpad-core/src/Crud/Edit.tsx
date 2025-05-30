'use client';
import * as React from 'react';
import PropTypes from 'prop-types';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import invariant from 'invariant';
import { useNotifications } from '../useNotifications';
import { CrudContext } from '../shared/context';
import { useLocaleText } from '../AppProvider/LocalizationProvider';
import { CrudForm, CrudFormSlotProps, CrudFormSlots } from './CrudForm';
import { DataSourceCache } from './cache';
import { useCachedDataSource } from './useCachedDataSource';
import { CRUD_DEFAULT_LOCALE_TEXT, type CRUDLocaleText } from './localeText';
import type { DataFieldFormValue, DataModel, DataModelId, DataSource, OmitId } from './types';

interface EditFormProps<D extends DataModel> {
  dataSource: DataSource<D> & Required<Pick<DataSource<D>, 'getOne' | 'updateOne'>>;
  initialValues: Partial<OmitId<D>>;
  onSubmit: (formValues: Partial<OmitId<D>>) => void | Promise<void>;
  onSubmitSuccess?: (formValues: Partial<OmitId<D>>) => void | Promise<void>;
  localeText: CRUDLocaleText;
  slots?: {
    form?: CrudFormSlots;
  };
  slotProps?: {
    form?: CrudFormSlotProps;
  };
}

function EditForm<D extends DataModel>(props: EditFormProps<D>) {
  const { dataSource, initialValues, onSubmit, onSubmitSuccess, localeText, slots, slotProps } =
    props;
  const { fields, validate } = dataSource;

  const notifications = useNotifications();

  const [formState, setFormState] = React.useState<{
    values: Partial<OmitId<D>>;
    errors: Partial<Record<keyof D, string>>;
  }>({
    values: {
      ...Object.fromEntries(
        fields
          .filter(({ field, editable }) => field !== 'id' && editable !== false)
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
    (name: keyof D, value: DataFieldFormValue) => {
      const validateField = async (values: Partial<OmitId<D>>) => {
        if (validate) {
          const { issues } = await validate(values);
          setFormErrors({
            ...formErrors,
            [name]: issues?.find((issue) => issue.path?.[0] === name)?.message,
          });
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
      const { issues } = await validate(formValues);
      if (issues && issues.length > 0) {
        setFormErrors(Object.fromEntries(issues.map((issue) => [issue.path?.[0], issue.message])));
        throw new Error('Form validation failed');
      }
    }
    setFormErrors({});

    try {
      await onSubmit(formValues);
      notifications.show(localeText.editSuccessMessage, {
        severity: 'success',
        autoHideDuration: 3000,
      });

      if (onSubmitSuccess) {
        await onSubmitSuccess(formValues);
      }
    } catch (editError) {
      notifications.show(`${localeText.editErrorMessage} ${(editError as Error).message}`, {
        severity: 'error',
        autoHideDuration: 3000,
      });
      throw editError;
    }
  }, [
    formValues,
    localeText.editErrorMessage,
    localeText.editSuccessMessage,
    notifications,
    onSubmit,
    onSubmitSuccess,
    setFormErrors,
    validate,
  ]);

  return (
    <CrudForm
      dataSource={dataSource}
      formState={formState}
      onFieldChange={handleFormFieldChange}
      onSubmit={handleFormSubmit}
      onReset={handleFormReset}
      submitButtonLabel={localeText.editLabel}
      slots={slots?.form}
      slotProps={slotProps?.form}
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
  localeText: PropTypes.object.isRequired,
  onSubmit: PropTypes.func.isRequired,
  onSubmitSuccess: PropTypes.func,
  slotProps: PropTypes.shape({
    form: PropTypes.shape({
      checkbox: PropTypes.object,
      datePicker: PropTypes.object,
      dateTimePicker: PropTypes.object,
      select: PropTypes.object,
      textField: PropTypes.object,
    }),
  }),
  slots: PropTypes.shape({
    form: PropTypes.shape({
      checkbox: PropTypes.elementType,
      datePicker: PropTypes.elementType,
      dateTimePicker: PropTypes.elementType,
      select: PropTypes.elementType,
      textField: PropTypes.elementType,
    }),
  }),
} as any;

export interface EditProps<D extends DataModel> {
  id: DataModelId;
  /**
   * Server-side [data source](https://mui.com/toolpad/core/react-crud/#data-sources).
   */
  dataSource?: DataSource<D> & Required<Pick<DataSource<D>, 'getOne' | 'updateOne'>>;
  /**
   * Callback fired when the form is successfully submitted.
   */
  onSubmitSuccess?: (formValues: Partial<OmitId<D>>) => void | Promise<void>;
  /**
   * [Cache](https://mui.com/toolpad/core/react-crud/#data-caching) for the data source.
   */
  dataSourceCache?: DataSourceCache | null;
  /**
   * Locale text for the component.
   */
  localeText?: CRUDLocaleText;
  /**
   * The components used for each slot inside.
   * @default {}
   */
  slots?: {
    form?: CrudFormSlots;
  };
  /**
   * The props used for each slot inside.
   * @default {}
   */
  slotProps?: {
    form?: CrudFormSlotProps;
  };
}

/**
 *
 * Demos:
 *
 * - [CRUD](https://mui.com/toolpad/core/react-crud/)
 *
 * API:
 *
 * - [Edit API](https://mui.com/toolpad/core/api/edit)
 */
function Edit<D extends DataModel>(props: EditProps<D>) {
  const {
    id,
    onSubmitSuccess,
    dataSourceCache,
    localeText: propsLocaleText,
    slots,
    slotProps,
  } = props;

  const globalLocaleText = useLocaleText();

  const crudContext = React.useContext(CrudContext);
  const dataSource = (props.dataSource ?? crudContext.dataSource) as NonNullable<
    typeof props.dataSource
  >;

  invariant(dataSource, 'No data source found.');

  const cache = React.useMemo(() => {
    const manualCache = dataSourceCache ?? crudContext.dataSourceCache;
    return typeof manualCache !== 'undefined' ? manualCache : new DataSourceCache();
  }, [crudContext.dataSourceCache, dataSourceCache]);
  const cachedDataSource = useCachedDataSource<D>(dataSource, cache) as NonNullable<
    typeof props.dataSource
  >;

  const { fields, validate, ...methods } = cachedDataSource;
  const { getOne, updateOne } = methods;

  const cachedData = React.useMemo(
    () => cache && (cache.get(JSON.stringify(['getOne', id])) as D),
    [cache, id],
  );

  const [data, setData] = React.useState<D | null>(cachedData);
  const [isLoading, setIsLoading] = React.useState(!cachedData);
  const [error, setError] = React.useState<Error | null>(null);

  const loadData = React.useCallback(async () => {
    setError(null);

    let showData = cachedData;
    if (!showData) {
      setIsLoading(true);

      try {
        showData = await getOne(id);
      } catch (showDataError) {
        setError(showDataError as Error);
      }
    }

    if (showData) {
      setData(showData);
    }
    setIsLoading(false);
  }, [cachedData, getOne, id]);

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

    const localeText = { ...CRUD_DEFAULT_LOCALE_TEXT, ...globalLocaleText, ...propsLocaleText };

    return data ? (
      <EditForm
        dataSource={dataSource}
        initialValues={data}
        onSubmit={handleSubmit}
        onSubmitSuccess={onSubmitSuccess}
        localeText={localeText}
        slots={slots}
        slotProps={slotProps}
      />
    ) : null;
  }, [
    data,
    dataSource,
    error,
    globalLocaleText,
    handleSubmit,
    isLoading,
    onSubmitSuccess,
    propsLocaleText,
    slotProps,
    slots,
  ]);

  return <Box sx={{ display: 'flex', flex: 1 }}>{renderEdit}</Box>;
}

Edit.propTypes /* remove-proptypes */ = {
  // ┌────────────────────────────── Warning ──────────────────────────────┐
  // │ These PropTypes are generated from the TypeScript type definitions. │
  // │ To update them, edit the TypeScript types and run `pnpm proptypes`. │
  // └─────────────────────────────────────────────────────────────────────┘
  /**
   * Server-side [data source](https://mui.com/toolpad/core/react-crud/#data-sources).
   */
  dataSource: PropTypes.object,
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
   * @ignore
   */
  id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  /**
   * Locale text for the component.
   */
  localeText: PropTypes.object,
  /**
   * Callback fired when the form is successfully submitted.
   */
  onSubmitSuccess: PropTypes.func,
  /**
   * The props used for each slot inside.
   * @default {}
   */
  slotProps: PropTypes.shape({
    form: PropTypes.shape({
      checkbox: PropTypes.object,
      datePicker: PropTypes.object,
      dateTimePicker: PropTypes.object,
      select: PropTypes.object,
      textField: PropTypes.object,
    }),
  }),
  /**
   * The components used for each slot inside.
   * @default {}
   */
  slots: PropTypes.shape({
    form: PropTypes.shape({
      checkbox: PropTypes.elementType,
      datePicker: PropTypes.elementType,
      dateTimePicker: PropTypes.elementType,
      select: PropTypes.elementType,
      textField: PropTypes.elementType,
    }),
  }),
} as any;

export { Edit };
