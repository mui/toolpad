'use client';
import * as React from 'react';
import PropTypes from 'prop-types';
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
import type { GridColDef, GridSingleSelectColDef } from '@mui/x-data-grid';
import dayjs, { Dayjs } from 'dayjs';
import { useNotifications } from '../useNotifications';
import { DataModel, DataSource } from './shared';

export interface CreateProps<D extends DataModel> {
  /**
   * Server-side data source.
   */
  dataSource: DataSource<D> & Required<Pick<DataSource<D>, 'createOne'>>;
  /**
   * Initial form values.
   */
  initialValues: Omit<D, 'id'>;
  /**
   * Function to validate form values. Returns object with error strings for each field.
   */
  validate: (
    formValues: Omit<D, 'id'>,
  ) => Partial<Record<keyof D, string>> | Promise<Partial<Record<keyof D, string>>>;
}

function Create<D extends DataModel>(props: CreateProps<D>) {
  const { dataSource, initialValues, validate } = props;
  const { fields, ...methods } = dataSource;
  const { createOne } = methods;

  const notifications = useNotifications();

  const [formState, setFormState] = React.useState<{
    values: Omit<D, 'id'>;
    errors: Partial<Record<keyof D, string>>;
  }>({
    values: initialValues,
    errors: {},
  });
  const formValues = formState.values;
  const formErrors = formState.errors;

  const setFormValues = React.useCallback((newFormValues: Omit<D, 'id'>) => {
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
      const validateField = async (values: Omit<D, 'id'>) => {
        const errors = await validate(values);
        setFormErrors({ ...formErrors, [name]: errors[name] });
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

  const [, submitAction, isSubmitting] = React.useActionState<null | Error, FormData>(async () => {
    const errors = await validate(formValues);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return new Error('Form validation failed');
    }
    setFormErrors({});

    try {
      await createOne(formValues);
      notifications.show('Item created successfully.', {
        severity: 'success',
      });

      handleFormReset();
    } catch (createError) {
      notifications.show(`Failed to create item. Reason: ${(createError as Error).message}`, {
        severity: 'error',
      });
      return createError as Error;
    }

    return null;
  }, null);

  const handleTextFieldChange = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      handleFormFieldChange(event.target.name, event.target.value);
    },
    [handleFormFieldChange],
  );

  const handleNumberFieldChange = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      handleFormFieldChange(event.target.name, Number(event.target.value));
    },
    [handleFormFieldChange],
  );

  const handleCheckboxFieldChange = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>, checked: boolean) => {
      handleFormFieldChange(event.target.name, checked);
    },
    [handleFormFieldChange],
  );

  const handleDateFieldChange = React.useCallback(
    (name: string) => (value: Dayjs | null) => {
      handleFormFieldChange(name, value?.toISOString() ?? null);
    },
    [handleFormFieldChange],
  );

  const handleSelectFieldChange = React.useCallback(
    (event: SelectChangeEvent) => {
      handleFormFieldChange(event.target.name, event.target.value);
    },
    [handleFormFieldChange],
  );

  const renderField = React.useCallback(
    (formField: GridColDef) => {
      const { field, type, headerName } = formField;

      const fieldValue = formValues[field];
      const fieldError = formErrors[field];

      let fieldElement = (
        <TextField
          value={fieldValue ?? ''}
          onChange={handleTextFieldChange}
          name={field}
          label={headerName}
          error={!!fieldError}
          helperText={fieldError ?? ' '}
          fullWidth
        />
      );
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
            <FormHelperText>{fieldError ?? ' '}</FormHelperText>
          </FormControl>
        );
      }
      if (type === 'date') {
        fieldElement = (
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              value={dayjs(fieldValue as string)}
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
              value={dayjs(fieldValue as string)}
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
        <Grid key={field} size={6} sx={{ display: 'flex', alignItems: 'center' }}>
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

  return (
    <Box
      component="form"
      action={submitAction}
      noValidate
      autoComplete="off"
      onReset={handleFormReset}
    >
      <FormGroup>
        <Grid container spacing={2} sx={{ mb: 2 }}>
          {fields.filter(({ field }) => field !== 'id').map(renderField)}
        </Grid>
      </FormGroup>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button type="submit" variant="contained" size="large" loading={isSubmitting}>
          Create
        </Button>
      </Box>
    </Box>
  );
}

Create.propTypes /* remove-proptypes */ = {
  // ┌────────────────────────────── Warning ──────────────────────────────┐
  // │ These PropTypes are generated from the TypeScript type definitions. │
  // │ To update them, edit the TypeScript types and run `pnpm proptypes`. │
  // └─────────────────────────────────────────────────────────────────────┘
  /**
   * Server-side data source.
   */
  dataSource: PropTypes.object.isRequired,
} as any;

export { Create };
