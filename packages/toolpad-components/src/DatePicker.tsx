import * as React from 'react';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DesktopDatePicker, DesktopDatePickerProps } from '@mui/x-date-pickers/DesktopDatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { createComponent } from '@mui/toolpad-core';
import dayjs from 'dayjs';
import { SX_PROP_HELPER_TEXT } from './constants.js';

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
  extends Omit<DesktopDatePickerProps<dayjs.Dayjs>, 'value' | 'onChange' | 'defaultValue'> {
  value?: string;
  onChange?: (newValue: string) => void;
  format: string;
  fullWidth: boolean;
  variant: 'outlined' | 'filled' | 'standard';
  size: 'small' | 'medium';
  sx: any;
  defaultValue?: string;
}

function DatePicker({
  format,
  onChange,
  value: valueProp,
  defaultValue: defaultValueProp,
  ...props
}: DatePickerProps) {
  const handleChange = React.useMemo(
    () =>
      onChange
        ? (value: dayjs.Dayjs | null) => {
            // date-only form of ISO8601. See https://tc39.es/ecma262/#sec-date-time-string-format
            const stringValue = value?.format('YYYY-MM-DD') || '';
            onChange(stringValue);
          }
        : undefined,
    [onChange],
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

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale={adapterLocale}>
      <DesktopDatePicker<dayjs.Dayjs>
        {...props}
        format={format || 'L'}
        value={value}
        onChange={handleChange}
        defaultValue={defaultValue}
        slotProps={{
          textField: {
            fullWidth: props.fullWidth,
            variant: props.variant,
            size: props.size,
            sx: props.sx,
          },
        }}
      />
    </LocalizationProvider>
  );
}

export default createComponent(DatePicker, {
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
    sx: {
      helperText: SX_PROP_HELPER_TEXT,
      typeDef: { type: 'object' },
    },
  },
});
