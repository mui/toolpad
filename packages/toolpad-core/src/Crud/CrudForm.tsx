'use client';
import * as React from 'react';
import PropTypes from 'prop-types';
import invariant from 'invariant';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox, { CheckboxProps } from '@mui/material/Checkbox';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormGroup from '@mui/material/FormGroup';
import FormHelperText from '@mui/material/FormHelperText';
import Grid from '@mui/material/Grid';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select, { SelectChangeEvent, SelectProps } from '@mui/material/Select';
import TextField, { TextFieldProps } from '@mui/material/TextField';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker, DatePickerProps } from '@mui/x-date-pickers/DatePicker';
import { DateTimePicker, DateTimePickerProps } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import type { GridSingleSelectColDef } from '@mui/x-data-grid';
import dayjs, { Dayjs } from 'dayjs';
import { CrudContext } from '../shared/context';
import type { DataField, DataFieldFormValue, DataModel, DataSource, OmitId } from './types';

interface CrudFormState<D extends DataModel> {
  values: Partial<OmitId<D>>;
  errors: Partial<Record<keyof D, string>>;
}

export interface CrudFormSlotProps {
  textField?: TextFieldProps;
  checkbox?: CheckboxProps;
  datePicker?: DatePickerProps;
  dateTimePicker?: DateTimePickerProps;
  select?: SelectProps;
}

export interface CrudFormSlots {
  /**
   * The text field component used in the form.
   * @default TextField
   */
  textField?: React.JSXElementConstructor<TextFieldProps>;
  /**
   * The checkbox component used in the form.
   * @default TextField
   */
  checkbox?: React.JSXElementConstructor<CheckboxProps>;
  /**
   * The date picker component used in the form.
   * @default DatePicker
   */
  datePicker?: React.JSXElementConstructor<DatePickerProps>;
  /**
   * The date and time picker component used in the form.
   * @default DatePicker
   */
  dateTimePicker?: React.JSXElementConstructor<DateTimePickerProps>;
  /**
   * The select component used in the form.
   * @default Select
   */
  select: React.JSXElementConstructor<SelectProps>;
}

export interface CrudFormProps<D extends DataModel> {
  /**
   * Server-side [data source](https://mui.com/toolpad/core/react-crud/#data-sources).
   */
  dataSource?: DataSource<D>;
  /**
   * Form state object, including field values and errors.
   */
  formState: CrudFormState<D>;
  /**
   * Callback fired when a form field is changed.
   */
  onFieldChange: (name: keyof D, value: DataFieldFormValue) => void | Promise<void>;
  /**
   * Callback fired when the form is submitted.
   */
  onSubmit: (formValues: Partial<OmitId<D>>) => void | Promise<void>;
  /**
   * Callback fired when the form is reset.
   */
  onReset?: (formValues: Partial<OmitId<D>>) => void | Promise<void>;
  /**
   * The components used for each slot inside.
   * @default {}
   */
  slots?: CrudFormSlots;
  /**
   * The props used for each slot inside.
   * @default {}
   */
  slotProps?: CrudFormSlotProps;
  /**
   * Text for form submit button.
   */
  submitButtonLabel: string;
}

/**
 *
 * Demos:
 *
 * - [CRUD](https://mui.com/toolpad/core/react-crud/)
 *
 * API:
 *
 * - [CrudForm API](https://mui.com/toolpad/core/api/crud-form)
 */
function CrudForm<D extends DataModel>(props: CrudFormProps<D>) {
  const { formState, onFieldChange, onSubmit, onReset, submitButtonLabel, slots, slotProps } =
    props;

  const formValues = formState.values;
  const formErrors = formState.errors;

  const crudContext = React.useContext(CrudContext);
  const dataSource = (props.dataSource ?? crudContext.dataSource) as NonNullable<
    typeof props.dataSource
  >;

  invariant(dataSource, 'No data source found.');

  const { fields } = dataSource;

  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleSubmit = React.useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      setIsSubmitting(true);
      try {
        await onSubmit(formValues);
      } finally {
        setIsSubmitting(false);
      }
    },
    [formValues, onSubmit],
  );

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
      const { field, type, headerName, renderFormField } = formField;

      const fieldValue = formValues[field];
      const fieldError = formErrors[field];

      let fieldElement: React.ReactNode = null;

      if (renderFormField) {
        fieldElement = renderFormField({
          value: (fieldValue ?? null) as DataFieldFormValue,
          onChange: (value) => onFieldChange(field, value),
          error: fieldError,
        });
      } else if (!type || type === 'string') {
        const TextFieldComponent = slots?.textField ?? TextField;

        fieldElement = (
          <TextFieldComponent
            value={fieldValue ?? ''}
            onChange={handleTextFieldChange}
            name={field}
            label={headerName}
            error={!!fieldError}
            helperText={fieldError ?? ' '}
            fullWidth
            {...slotProps?.textField}
          />
        );
      } else if (type === 'number') {
        const TextFieldComponent = slots?.textField ?? TextField;

        fieldElement = (
          <TextFieldComponent
            value={fieldValue ?? ''}
            onChange={handleNumberFieldChange}
            name={field}
            type="number"
            label={headerName}
            error={!!fieldError}
            helperText={fieldError ?? ' '}
            fullWidth
            {...slotProps?.textField}
          />
        );
      } else if (type === 'boolean') {
        const CheckBoxComponent = slots?.checkbox ?? Checkbox;

        fieldElement = (
          <FormControl>
            <FormControlLabel
              name={field}
              control={
                <CheckBoxComponent
                  size="large"
                  checked={fieldValue as boolean}
                  onChange={handleCheckboxFieldChange}
                  {...slotProps?.checkbox}
                />
              }
              label={headerName}
            />
            <FormHelperText error={!!fieldError}>{fieldError ?? ' '}</FormHelperText>
          </FormControl>
        );
      } else if (type === 'date') {
        const DatePickerComponent = slots?.datePicker ?? DatePicker;

        fieldElement = (
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePickerComponent
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
              {...slotProps?.datePicker}
            />
          </LocalizationProvider>
        );
      } else if (type === 'dateTime') {
        const DateTimePickerComponent = slots?.dateTimePicker ?? DateTimePicker;

        fieldElement = (
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DateTimePickerComponent
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
              {...slotProps?.dateTimePicker}
            />
          </LocalizationProvider>
        );
      } else if (type === 'singleSelect') {
        const SelectComponent = slots?.select ?? Select;

        const { getOptionValue, getOptionLabel, valueOptions } =
          formField as GridSingleSelectColDef;

        if (valueOptions && Array.isArray(valueOptions)) {
          const labelId = `${field}-label`;

          fieldElement = (
            <FormControl error={!!fieldError} fullWidth>
              <InputLabel id={labelId}>{headerName}</InputLabel>
              <SelectComponent
                value={(fieldValue as string) ?? ''}
                onChange={handleSelectFieldChange as SelectProps['onChange']}
                labelId={labelId}
                name={field}
                label={headerName}
                defaultValue=""
                fullWidth
                {...slotProps?.select}
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
              </SelectComponent>
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
      onFieldChange,
      slotProps,
      slots,
    ],
  );

  const handleReset = React.useCallback(async () => {
    if (onReset) {
      await onReset(formValues);
    }
  }, [formValues, onReset]);

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
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
          {submitButtonLabel}
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
   * Server-side [data source](https://mui.com/toolpad/core/react-crud/#data-sources).
   */
  dataSource: PropTypes.object,
  /**
   * Form state object, including field values and errors.
   */
  formState: PropTypes.shape({
    errors: PropTypes.object.isRequired,
    values: PropTypes.object.isRequired,
  }).isRequired,
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
  /**
   * The props used for each slot inside.
   * @default {}
   */
  slotProps: PropTypes.shape({
    checkbox: PropTypes.object,
    datePicker: PropTypes.object,
    dateTimePicker: PropTypes.object,
    select: PropTypes.object,
    textField: PropTypes.object,
  }),
  /**
   * The components used for each slot inside.
   * @default {}
   */
  slots: PropTypes.shape({
    checkbox: PropTypes.elementType,
    datePicker: PropTypes.elementType,
    dateTimePicker: PropTypes.elementType,
    select: PropTypes.elementType,
    textField: PropTypes.elementType,
  }),
  /**
   * Text for form submit button.
   */
  submitButtonLabel: PropTypes.string.isRequired,
} as any;

export { CrudForm };
