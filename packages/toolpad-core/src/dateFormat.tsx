import { MenuItem, Stack, SxProps, TextField, styled } from '@mui/material';
import * as React from 'react';

export interface DateFormatPreset {
  label?: string;
  options?: Intl.DateTimeFormatOptions;
}

const DEFAULT_DATE_FORMAT = 'short';
const DEFAULT_TIME_FORMAT = 'short';

export const DATE_FORMAT_PRESETS = new Map<string, DateFormatPreset>([
  [
    'full',
    {
      label: 'Full',
      options: {
        dateStyle: 'full',
      },
    },
  ],
  [
    'long',
    {
      label: 'Long',
      options: {
        dateStyle: 'long',
      },
    },
  ],
  [
    'medium',
    {
      label: 'Medium',
      options: {
        dateStyle: 'medium',
      },
    },
  ],
  [
    'short',
    {
      label: 'Short',
      options: {
        dateStyle: 'short',
      },
    },
  ],
]);

export const TIME_FORMAT_PRESETS = new Map<string, DateFormatPreset>([
  [
    'full',
    {
      label: 'Full',
      options: {
        timeStyle: 'full',
      },
    },
  ],
  [
    'long',
    {
      label: 'Long',
      options: {
        timeStyle: 'long',
      },
    },
  ],
  [
    'medium',
    {
      label: 'Medium',
      options: {
        timeStyle: 'medium',
      },
    },
  ],
  [
    'short',
    {
      label: 'Short',
      options: {
        timeStyle: 'short',
      },
    },
  ],
]);

export interface DateFormat {
  kind: 'preset';
  datePreset?: string;
  timePreset?: string;
}

export function createFormat(dateFormat?: DateFormat) {
  if (!dateFormat) {
    return new Intl.DateTimeFormat(undefined, {});
  }
  switch (dateFormat.kind) {
    case 'preset': {
      const datePreset = dateFormat.datePreset
        ? DATE_FORMAT_PRESETS.get(dateFormat.datePreset)
        : undefined;
      const timePreset = dateFormat.timePreset
        ? TIME_FORMAT_PRESETS.get(dateFormat.timePreset)
        : undefined;
      return new Intl.DateTimeFormat(undefined, { ...datePreset?.options, ...timePreset?.options });
    }
    default: {
      return new Intl.DateTimeFormat();
    }
  }
}

const PrettyDateFormatRoot = styled('span')({});

const DEFAULT_FORMAT = new Intl.DateTimeFormat();

export interface FormattedDateProps {
  format?: Intl.DateTimeFormat;
  children: Date | number;
}

export function FormattedDate({ children, format = DEFAULT_FORMAT }: FormattedDateProps) {
  const parts = React.useMemo(() => format.formatToParts(children), [children, format]);
  return (
    <PrettyDateFormatRoot>
      {parts.map((part, i) => (
        <span key={i} className={`date-token-type-${part.type}`}>
          {part.value}
        </span>
      ))}
    </PrettyDateFormatRoot>
  );
}

function formatDateOptionValue(dateFormat: DateFormat | undefined) {
  if (!dateFormat) {
    return `preset:${DEFAULT_DATE_FORMAT}`;
  }
  switch (dateFormat.kind) {
    case 'preset':
      return ['preset', dateFormat.datePreset ?? DEFAULT_DATE_FORMAT].join(':');
    default:
      return `preset:${DEFAULT_DATE_FORMAT}`;
  }
}

function formatTimeOptionValue(dateFormat: DateFormat | undefined) {
  if (!dateFormat) {
    return `preset:${DEFAULT_TIME_FORMAT}`;
  }
  switch (dateFormat.kind) {
    case 'preset':
      return ['preset', dateFormat.timePreset ?? DEFAULT_TIME_FORMAT].join(':');
    default:
      return `preset:${DEFAULT_TIME_FORMAT}`;
  }
}

export interface DateFormatEditorProps {
  value?: DateFormat;
  onChange: (newValue?: DateFormat) => void;
  disabled?: boolean;
  sx?: SxProps;
  label?: string;
  disableTimeFormat?: boolean;
}

export function DateFormatEditor({
  label,
  disabled,
  value,
  onChange,
  sx,
  disableTimeFormat,
}: DateFormatEditorProps) {
  return (
    <Stack sx={sx} gap={1}>
      <TextField
        select
        fullWidth
        label={label ?? 'Date format'}
        value={formatDateOptionValue(value)}
        disabled={disabled}
        onChange={(event) => {
          let dateFormat: DateFormat | undefined;

          if (event.target.value) {
            const [prefix, datePreset] = event.target.value.split(':');

            if (prefix === 'preset') {
              dateFormat = {
                kind: 'preset',
                datePreset,
                timePreset: disableTimeFormat
                  ? undefined
                  : value?.timePreset || DEFAULT_TIME_FORMAT,
              };
            }
          }

          onChange(dateFormat);
        }}
      >
        {Array.from(DATE_FORMAT_PRESETS, ([type, preset]) => (
          <MenuItem key={type} value={`preset:${type}`}>
            {preset.label || type}
          </MenuItem>
        ))}
      </TextField>
      {disableTimeFormat ? null : (
        <TextField
          select
          fullWidth
          label={label ?? 'Time format'}
          value={formatTimeOptionValue(value)}
          disabled={disabled}
          onChange={(event) => {
            let dateFormat: DateFormat | undefined;

            if (event.target.value) {
              const [prefix, timePreset] = event.target.value.split(':');

              if (prefix === 'preset') {
                dateFormat = {
                  kind: 'preset',
                  datePreset: value?.datePreset || DEFAULT_DATE_FORMAT,
                  timePreset,
                };
              }
            }

            onChange(dateFormat);
          }}
        >
          {Array.from(TIME_FORMAT_PRESETS, ([type, preset]) => (
            <MenuItem key={type} value={`preset:${type}`}>
              {preset.label || type}
            </MenuItem>
          ))}
        </TextField>
      )}
    </Stack>
  );
}
