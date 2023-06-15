import * as React from 'react';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DesktopDatePicker, DesktopDatePickerProps } from '@mui/x-date-pickers/DesktopDatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { createComponent, useNode } from '@mui/toolpad-core';
import dayjs from 'dayjs';
import { Controller, FieldError } from 'react-hook-form';
import { FormContext, useFormInput, withComponentForm } from './Form.js';
import { SX_PROP_HELPER_TEXT } from './constants.js';

const LOCALE_LOADERS = new Map(
  // jest is choking on this dynamic import
  process.env.NODE_ENV === 'test'
    ? []
    : [
        ['en', () => import('dayjs/locale/en')],
        ['nl', () => import('dayjs/locale/nl')],
        ['fr', () => import('dayjs/locale/fr')],
        // TODO...
      ],
);

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
  extends Omit<DesktopDatePickerProps<dayjs.Dayjs>, 'value' | 'onChange' | 'defaultValue'> {
  value?: string;
  onChange: (newValue: string | null) => void;
  format: string;
  fullWidth: boolean;
  variant: 'outlined' | 'filled' | 'standard';
  size: 'small' | 'medium';
  sx: any;
  defaultValue?: string;
  name: string;
  isRequired: boolean;
  isInvalid: boolean;
}

function DatePicker({
  format,
  onChange,
  value: valueProp,
  defaultValue: defaultValueProp,
  isRequired,
  isInvalid,
  ...rest
}: DatePickerProps) {
  const nodeRuntime = useNode();

  const fieldName = rest.name || nodeRuntime?.nodeName;

  const fallbackName = React.useId();
  const nodeName = fieldName || fallbackName;

  const { form } = React.useContext(FormContext);
  const fieldError = nodeName && form?.formState.errors[nodeName];

  const validationProps = React.useMemo(() => ({ isRequired, isInvalid }), [isInvalid, isRequired]);

  const { onFormInputChange } = useFormInput<string | null>({
    name: nodeName,
    value: valueProp,
    onChange,
    defaultValue: defaultValueProp,
    emptyValue: null,
    validationProps,
  });

  const handleChange = React.useMemo(
    () =>
      onChange
        ? (newValue: dayjs.Dayjs | null) => {
            // date-only form of ISO8601. See https://tc39.es/ecma262/#sec-date-time-string-format
            const stringValue = newValue?.format('YYYY-MM-DD') || '';

            if (form) {
              onFormInputChange(stringValue);
            } else {
              onChange(stringValue);
            }
          }
        : undefined,
    [form, onChange, onFormInputChange],
  );

  const adapterLocale = React.useSyncExternalStore(subscribeLocaleLoader, getSnapshot);

  const value = React.useMemo(
    () => (typeof valueProp === 'string' ? dayjs(valueProp) : valueProp),
    [valueProp],
  );

  const defaultValue = React.useMemo(
    () => (typeof defaultValueProp === 'string' ? dayjs(defaultValueProp) : defaultValueProp),
    [defaultValueProp],
  );

  const datePickerElement = (
    <DesktopDatePicker<dayjs.Dayjs>
      {...rest}
      format={format || 'L'}
      value={value || null}
      onChange={handleChange}
      defaultValue={defaultValue}
      slotProps={{
        textField: {
          fullWidth: rest.fullWidth,
          variant: rest.variant,
          size: rest.size,
          sx: rest.sx,
          ...(form && {
            error: Boolean(fieldError),
            helperText: (fieldError as FieldError)?.message || '',
          }),
        },
      }}
    />
  );

  const fieldDisplayName = rest.label || fieldName || 'Field';

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale={adapterLocale}>
      {form && nodeName ? (
        <Controller
          name={nodeName}
          control={form.control}
          rules={{
            required: isRequired ? `${fieldDisplayName} is required.` : false,
            validate: () => !isInvalid || `${fieldDisplayName} is invalid.`,
          }}
          render={() => datePickerElement}
        />
      ) : (
        datePickerElement
      )}
    </LocalizationProvider>
  );
}

const FormWrappedDatePicker = withComponentForm(DatePicker);

export default createComponent(FormWrappedDatePicker, {
  helperText:
    'The MUI X [Date Picker](https://mui.com/x/react-date-pickers/date-picker/) component.\n\nThe date picker lets the user select a date.',
  argTypes: {
    value: {
      helperText: 'The currently selected date.',
      type: 'string',
      default: '',
      onChangeProp: 'onChange',
      defaultValueProp: 'defaultValue',
    },
    format: {
      helperText:
        'The [format](https://day.js.org/docs/en/display/format) of the date in the UI. The value for the bindings will always be in the `YYYY-MM-DD` format. Leave empty to let the end-user locale define the format.',

      type: 'string',
      default: '',
    },
    defaultValue: {
      helperText: 'A default value for the date picker.',
      type: 'string',
      default: '',
    },
    label: {
      helperText: 'A label that describes the content of the date picker. e.g. "Arrival date".',
      type: 'string',
    },
    name: {
      helperText: 'Name of this element. Used as a reference in form data.',
      type: 'string',
    },
    variant: {
      helperText:
        'One of the available MUI TextField [variants](https://mui.com/material-ui/react-button/#basic-button). Possible values are `outlined`, `filled` or `standard`',
      type: 'string',
      enum: ['outlined', 'filled', 'standard'],
      default: 'outlined',
    },
    size: {
      helperText: 'The size of the component. One of `small`, or `medium`.',
      type: 'string',
      enum: ['small', 'medium'],
      default: 'small',
    },
    fullWidth: {
      helperText: 'Whether the button should occupy all available horizontal space.',
      type: 'boolean',
    },
    disabled: {
      helperText: 'The date picker is disabled.',
      type: 'boolean',
    },
    isRequired: {
      helperText: 'Whether the date picker is required to have a value.',
      type: 'boolean',
      default: false,
      category: 'validation',
    },
    isInvalid: {
      helperText: 'Whether the date picker value is invalid.',
      type: 'boolean',
      default: false,
      category: 'validation',
    },
    sx: {
      helperText: SX_PROP_HELPER_TEXT,
      type: 'object',
    },
  },
});
