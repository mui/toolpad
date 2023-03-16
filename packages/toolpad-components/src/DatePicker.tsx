import * as React from 'react';
import { TextField } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DesktopDatePicker, DesktopDatePickerProps } from '@mui/x-date-pickers/DesktopDatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { createComponent, useNode } from '@mui/toolpad-core';
import { Dayjs } from 'dayjs';
import { Controller, FieldError } from 'react-hook-form';
import { SX_PROP_HELPER_TEXT } from './constants';
import Form, { FormContext } from './Form';

const LOCALE_LOADERS = new Map([
  ['en', () => import('dayjs/locale/en')],
  ['nl', () => import('dayjs/locale/nl')],
  ['fr', () => import('dayjs/locale/fr')],
  // TODO...
]);

interface LoadableLocale {
  locale: string;
  load: () => Promise<unknown>;
}

const handlers = new Set<() => void>();
let loadedLocale: undefined | string;

function trygetLoadableLocale(locale: string): LoadableLocale | null {
  const load = LOCALE_LOADERS.get(locale);
  if (load) {
    return { locale, load };
  }
  return null;
}

function getLoadableLocale(): LoadableLocale | null {
  if (typeof window === 'undefined') {
    return null;
  }
  const languages = window.navigator.languages;
  for (const locale of languages) {
    const { language } = new Intl.Locale(locale);
    const result = trygetLoadableLocale(locale) || trygetLoadableLocale(language);
    if (result) {
      return result;
    }
  }
  return null;
}

const loadableLocale = getLoadableLocale();
if (loadableLocale) {
  loadableLocale.load().then(() => {
    loadedLocale = loadableLocale.locale;
    handlers.forEach((handler) => handler());
  });
}

function subscribeLocaleLoader(cb: () => void) {
  handlers.add(cb);
  return () => handlers.delete(cb);
}

function getSnapshot() {
  return loadedLocale;
}

export interface DatePickerProps
  extends Omit<DesktopDatePickerProps<string, Dayjs>, 'value' | 'onChange'> {
  value: string;
  onChange: (newValue: string) => void;
  format: string;
  fullWidth: boolean;
  variant: 'outlined' | 'filled' | 'standard';
  size: 'small' | 'medium';
  sx: any;
  defaultValue: string;
  name: string;
  isRequired: boolean;
  isInvalid: boolean;
}

function DatePicker({ format, onChange, value, isRequired, isInvalid, ...rest }: DatePickerProps) {
  const nodeRuntime = useNode();

  const nodeName = rest.name || nodeRuntime?.nodeName;

  const { form, fieldValues } = React.useContext(FormContext);
  const fieldError = nodeName && form?.formState.errors[nodeName];

  const handleChange = React.useCallback(
    (newValue: Dayjs | null) => {
      // date-only form of ISO8601. See https://tc39.es/ecma262/#sec-date-time-string-format
      const stringValue = newValue?.format('YYYY-MM-DD') || '';

      if (form && nodeName) {
        form.setValue(nodeName, stringValue, { shouldValidate: true, shouldDirty: true });
      } else {
        onChange(stringValue);
      }
    },
    [form, nodeName, onChange],
  );

  const isInitialForm = Object.keys(fieldValues).length === 0;

  React.useEffect(() => {
    if (form && nodeName) {
      if (rest.defaultValue && isInitialForm) {
        const defaultValue = rest.defaultValue || null;

        onChange(defaultValue as string);
        form.setValue(nodeName, defaultValue);
      } else {
        onChange(fieldValues[nodeName]);
      }
    }
  }, [fieldValues, form, isInitialForm, nodeName, onChange, rest.defaultValue]);

  const adapterLocale = React.useSyncExternalStore(subscribeLocaleLoader, getSnapshot);

  const datePickerProps: DesktopDatePickerProps<any, any> = {
    ...rest,
    inputFormat: format || 'L',
    value: value || null,
    onChange: handleChange,
    renderInput: (params) => (
      <TextField
        {...params}
        fullWidth={rest.fullWidth}
        variant={rest.variant}
        size={rest.size}
        sx={rest.sx}
        {...(form && {
          error: Boolean(fieldError),
          helperText: (fieldError as FieldError)?.message || '',
        })}
      />
    ),
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale={adapterLocale}>
      {form && nodeName ? (
        <Controller
          name={nodeName}
          control={form.control}
          rules={{
            required: isRequired ? `${nodeName} is required.` : false,
            validate: () => !isInvalid || `${nodeName} is invalid.`,
          }}
          render={() => <DesktopDatePicker {...datePickerProps} />}
        />
      ) : (
        <DesktopDatePicker {...datePickerProps} />
      )}
    </LocalizationProvider>
  );
}

function FormWrappedDatePicker(props: DatePickerProps) {
  const { form } = React.useContext(FormContext);

  const [componentFormValue, setComponentFormValue] = React.useState({});

  return form ? (
    <DatePicker {...props} />
  ) : (
    <Form
      value={componentFormValue}
      onChange={setComponentFormValue}
      mode="onBlur"
      hasChrome={false}
    >
      <DatePicker {...props} />
    </Form>
  );
}

export default createComponent(FormWrappedDatePicker, {
  helperText:
    'The MUI X [Date picker](https://mui.com/x/react-date-pickers/date-picker/) component.\n\nThe date picker lets the user select a date.',
  argTypes: {
    value: {
      helperText: 'The currently selected date.',
      typeDef: { type: 'string', default: '' },
      onChangeProp: 'onChange',
      defaultValueProp: 'defaultValue',
    },
    format: {
      helperText:
        'The [format](https://day.js.org/docs/en/display/format) of the date in the UI. The value for the bindings will always be in the `YYYY-MM-DD` format. Leave empty to let the end-user locale define the format.',
      typeDef: {
        type: 'string',
        default: '',
      },
    },
    defaultValue: {
      helperText: 'A default value for the date picker.',
      typeDef: { type: 'string', default: '' },
    },
    label: {
      helperText: 'A label that describes the content of the date picker. e.g. "Arrival date".',
      typeDef: { type: 'string' },
    },
    name: {
      helperText: 'Name of this element. Used as a reference in form data.',
      typeDef: { type: 'string' },
    },
    variant: {
      helperText:
        'One of the available MUI TextField [variants](https://mui.com/material-ui/react-button/#basic-button). Possible values are `outlined`, `filled` or `standard`',
      typeDef: { type: 'string', enum: ['outlined', 'filled', 'standard'], default: 'outlined' },
    },
    size: {
      helperText: 'The size of the component. One of `small`, or `medium`.',
      typeDef: { type: 'string', enum: ['small', 'medium'], default: 'small' },
    },
    fullWidth: {
      helperText: 'Whether the button should occupy all available horizontal space.',
      typeDef: { type: 'boolean' },
    },
    disabled: {
      helperText: 'The date picker is disabled.',
      typeDef: { type: 'boolean' },
    },
    isRequired: {
      helperText: 'Whether the date picker is required to have a value.',
      typeDef: { type: 'boolean', default: false },
      category: 'validation',
    },
    isInvalid: {
      helperText: 'Whether the date picker value is invalid.',
      typeDef: { type: 'boolean', default: false },
      category: 'validation',
    },
    sx: {
      helperText: SX_PROP_HELPER_TEXT,
      typeDef: { type: 'object' },
    },
  },
});
