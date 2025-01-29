'use client';
import * as React from 'react';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormGroup from '@mui/material/FormGroup';
import Grid from '@mui/material/Grid2';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import TextField from '@mui/material/TextField';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import type { GridColDef, GridSingleSelectColDef } from '@mui/x-data-grid';
import { useNotifications } from '../useNotifications';
import { DataModel, DataSource } from './shared';

interface Form<D extends Omit<DataModel, 'id'>> {
  value: D;
  onChange: (name: keyof D, value: string | number | boolean | File | null) => void;
  onReset: () => void;
}

export interface CreateProps<D extends DataModel> {
  /**
   * Server-side data source.
   */
  dataSource: DataSource<D> & Required<Pick<DataSource<D>, 'createOne'>>;
  /**
   * Form implementation.
   */
  form: Form<Omit<D, 'id'>>;
}

function Create<D extends DataModel>(props: CreateProps<D>) {
  const { dataSource, form } = props;
  const { fields, ...methods } = dataSource;
  const { createOne } = methods;

  const notifications = useNotifications();

  const [, submitAction, isSubmitting] = React.useActionState<null | Error, FormData>(async () => {
    try {
      await createOne(form.value);
      notifications.show('Item created successfully.', {
        severity: 'success',
      });
      form.onReset();
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
      form.onChange(event.target.name as keyof Omit<D, 'id'>, event.target.value);
    },
    [form],
  );

  const handleCheckboxFieldChange = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>, checked: boolean) => {
      form.onChange(event.target.name as keyof Omit<D, 'id'>, checked);
    },
    [form],
  );

  const handleDateFieldChange = React.useCallback(() => {}, []);

  const handleSelectFieldChange = React.useCallback(() => {}, []);

  const renderField = React.useCallback(
    (formField: GridColDef) => {
      const { field, type, headerName } = formField;

      const fieldValue = form.value[field];

      let fieldElement = (
        <TextField
          value={fieldValue}
          onChange={handleTextFieldChange}
          name={field}
          label={headerName}
          fullWidth
        />
      );
      if (type === 'number') {
        fieldElement = (
          <TextField
            value={fieldValue}
            onChange={handleTextFieldChange}
            name={field}
            type="number"
            label={headerName}
            fullWidth
          />
        );
      }
      if (type === 'boolean') {
        fieldElement = (
          <FormControlLabel
            value={fieldValue}
            onChange={handleCheckboxFieldChange}
            name={field}
            control={<Checkbox size="large" />}
            label={headerName}
          />
        );
      }
      if (type === 'date') {
        fieldElement = (
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              value={dayJs(fieldValue)}
              onChange={handleDateFieldChange}
              name={field}
              label={headerName}
              slotProps={{
                textField: {
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
              value={dayJs(fieldValue)}
              onChange={handleDateFieldChange}
              name={field}
              label={headerName}
              slotProps={{
                textField: {
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
            <FormControl fullWidth>
              <InputLabel id={labelId}>{headerName}</InputLabel>
              <Select
                value={fieldValue}
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
    [form.onChange, form.value, handleCheckboxFieldChange, handleTextFieldChange],
  );

  return (
    <Box
      component="form"
      action={submitAction}
      noValidate
      autoComplete="off"
      onReset={form.onReset}
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
