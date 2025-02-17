'use client';
import * as React from 'react';
import PropTypes from 'prop-types';
import invariant from 'invariant';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormGroup from '@mui/material/FormGroup';
import FormHelperText from '@mui/material/FormHelperText';
import Grid from '@mui/material/Grid2';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import TextField from '@mui/material/TextField';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import type { GridSingleSelectColDef } from '@mui/x-data-grid';
import dayjs, { Dayjs } from 'dayjs';
import { CrudContext } from '../shared/context';
import { DataField, DataModel, DataSource, OmitId } from './shared';

interface CrudFormState<D extends DataModel> {
  values: Partial<OmitId<D>>;
  errors: Partial<Record<keyof D, string>>;
}

interface CrudFormLocaleText {
  submitButtonLabel: string;
}

export interface CrudFormProps<D extends DataModel> {
  /**
   * Server-side data source.
   */
  dataSource:
    | (DataSource<D> & Required<Pick<DataSource<D>, 'createOne'>>)
    | (DataSource<D> & Required<Pick<DataSource<D>, 'updateOne'>>);
  /**
   * Form state object, including field values and errors.
   */
  formState: CrudFormState<D>;
  /**
   * Callback fired when a form field is changed.
   */
  onFieldChange: (
    name: keyof D,
    value: string | number | boolean | File | null,
  ) => void | Promise<void>;
  /**
   * Callback fired when the form is submitted.
   */
  onSubmit: (formValues: Partial<OmitId<D>>) => void | Promise<void>;
  /**
   * Callback fired when the form is reset.
   */
  onReset?: (formValues: Partial<OmitId<D>>) => void | Promise<void>;
  /**
   * Locale text for CRUD form component.
   */
  localeText: CrudFormLocaleText;
}
/**
 *
 * Demos:
 *
 * - [Crud](https://mui.com/toolpad/core/react-crud/)
 *
 * API:
 *
 * - [CrudForm API](https://mui.com/toolpad/core/api/crud-form)
 */
function CrudForm<D extends DataModel>(props: CrudFormProps<D>) {
  const { formState, onFieldChange, onSubmit, onReset, localeText } = props;

  const formValues = formState.values;
  const formErrors = formState.errors;

  const crudContext = React.useContext(CrudContext);
  const dataSource = (props.dataSource ?? crudContext.dataSource) as Exclude<
    typeof props.dataSource,
    undefined
  >;

  invariant(dataSource, 'No data source found.');

  const { fields } = dataSource;

  const [, submitAction, isSubmitting] = React.useActionState<null | Error, FormData>(async () => {
    try {
      await onSubmit(formState.values);
    } catch (error) {
      return error as Error;
    }
    return null;
  }, null);

  const handleTextFieldChange = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      onFieldChange(event.target.name, event.target.value);
    },
    [onFieldChange],
  );

  const handleNumberFieldChange = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      onFieldChange(event.target.name, Number(event.target.value));
    },
    [onFieldChange],
  );

  const handleCheckboxFieldChange = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>, checked: boolean) => {
      onFieldChange(event.target.name, checked);
    },
    [onFieldChange],
  );

  const handleDateFieldChange = React.useCallback(
    (name: string) => (value: Dayjs | null) => {
      if (value?.isValid()) {
        onFieldChange(name, value.toISOString() ?? null);
      } else if (formValues[name]) {
        onFieldChange(name, null);
      }
    },
    [formValues, onFieldChange],
  );

  const handleSelectFieldChange = React.useCallback(
    (event: SelectChangeEvent) => {
      onFieldChange(event.target.name, event.target.value);
    },
    [onFieldChange],
  );

  const renderField = React.useCallback(
    (formField: DataField) => {
      const { field, type, headerName } = formField;

      const fieldValue = formValues[field];
      const fieldError = formErrors[field];

      let fieldElement: React.ReactNode = null;
      if (!type || type === 'string' || type === 'longString') {
        fieldElement = (
          <TextField
            value={fieldValue ?? ''}
            onChange={handleTextFieldChange}
            name={field}
            label={headerName}
            error={!!fieldError}
            helperText={fieldError ?? ' '}
            fullWidth
            multiline={type === 'longString'}
            minRows={type === 'longString' ? 2 : undefined}
          />
        );
      }
      if (type === 'number') {
        fieldElement = (
          <TextField
            value={fieldValue ?? ''}
            onChange={handleNumberFieldChange}
            name={field}
            type="number"
            label={headerName}
            error={!!fieldError}
            helperText={fieldError ?? ' '}
            fullWidth
          />
        );
      }
      if (type === 'boolean') {
        fieldElement = (
          <FormControl>
            <FormControlLabel
              name={field}
              control={
                <Checkbox size="large" value={fieldValue} onChange={handleCheckboxFieldChange} />
              }
              label={headerName}
            />
            <FormHelperText error={!!fieldError}>{fieldError ?? ' '}</FormHelperText>
          </FormControl>
        );
      }
      if (type === 'date') {
        fieldElement = (
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              value={fieldValue ? dayjs(fieldValue as string) : null}
              onChange={handleDateFieldChange(field)}
              name={field}
              label={headerName}
              slotProps={{
                textField: {
                  error: !!fieldError,
                  helperText: fieldError ?? ' ',
                  fullWidth: true,
                },
              }}
            />
          </LocalizationProvider>
        );
      }
      if (type === 'dateTime') {
        fieldElement = (
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DateTimePicker
              value={fieldValue ? dayjs(fieldValue as string) : null}
              onChange={handleDateFieldChange(field)}
              name={field}
              label={headerName}
              slotProps={{
                textField: {
                  error: !!fieldError,
                  helperText: fieldError ?? ' ',
                  fullWidth: true,
                },
              }}
            />
          </LocalizationProvider>
        );
      }
      if (type === 'singleSelect') {
        const { getOptionValue, getOptionLabel, valueOptions } =
          formField as GridSingleSelectColDef;

        if (valueOptions && Array.isArray(valueOptions)) {
          const labelId = `${field}-label`;

          fieldElement = (
            <FormControl error={!!fieldError} fullWidth>
              <InputLabel id={labelId}>{headerName}</InputLabel>
              <Select
                value={(fieldValue as string) ?? ''}
                onChange={handleSelectFieldChange}
                labelId={labelId}
                name={field}
                label={headerName}
                defaultValue=""
                fullWidth
              >
                {valueOptions.map((option) => {
                  let optionValue: string | number = option as string | number;
                  let optionLabel: string | number = option as string | number;
                  if (typeof option !== 'string' && typeof option !== 'number') {
                    optionValue = getOptionValue ? getOptionValue(option) : option.value;
                    optionLabel = getOptionLabel ? getOptionLabel(option) : option.label;
                  }

                  return (
                    <MenuItem key={optionValue} value={optionValue}>
                      {optionLabel}
                    </MenuItem>
                  );
                })}
              </Select>
              <FormHelperText>{fieldError ?? ' '}</FormHelperText>
            </FormControl>
          );
        }
      }

      return (
        <Grid key={field} size={{ xs: 12, sm: 6 }} sx={{ display: 'flex' }}>
          {fieldElement}
        </Grid>
      );
    },
    [
      formErrors,
      formValues,
      handleCheckboxFieldChange,
      handleDateFieldChange,
      handleNumberFieldChange,
      handleSelectFieldChange,
      handleTextFieldChange,
    ],
  );

  const handleReset = React.useCallback(async () => {
    if (onReset) {
      await onReset(formState.values);
    }
  }, [formState.values, onReset]);

  return (
    <Box
      component="form"
      action={submitAction}
      noValidate
      autoComplete="off"
      onReset={handleReset}
      sx={{ width: '100%' }}
    >
      <FormGroup>
        <Grid container spacing={2} sx={{ mb: 2, width: '100%' }}>
          {fields.filter(({ field }) => field !== 'id').map(renderField)}
        </Grid>
      </FormGroup>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button type="submit" variant="contained" size="large" loading={isSubmitting}>
          {localeText.submitButtonLabel}
        </Button>
      </Box>
    </Box>
  );
}

CrudForm.propTypes /* remove-proptypes */ = {
  // ┌────────────────────────────── Warning ──────────────────────────────┐
  // │ These PropTypes are generated from the TypeScript type definitions. │
  // │ To update them, edit the TypeScript types and run `pnpm proptypes`. │
  // └─────────────────────────────────────────────────────────────────────┘
  /**
   * Server-side data source.
   */
  dataSource: PropTypes.object.isRequired,
  /**
   * Form state object, including field values and errors.
   */
  formState: PropTypes.shape({
    errors: PropTypes.object.isRequired,
    values: PropTypes.object.isRequired,
  }).isRequired,
  /**
   * Locale text for CRUD form component.
   */
  localeText: PropTypes.object.isRequired,
  /**
   * Callback fired when a form field is changed.
   */
  onFieldChange: PropTypes.func.isRequired,
  /**
   * Callback fired when the form is reset.
   */
  onReset: PropTypes.func,
  /**
   * Callback fired when the form is submitted.
   */
  onSubmit: PropTypes.func.isRequired,
} as any;

export { CrudForm };
