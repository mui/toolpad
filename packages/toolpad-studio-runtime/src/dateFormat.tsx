import { MenuItem, Stack, SxProps, TextField, styled } from '@mui/material';
import * as React from 'react';

export interface DateFormatPreset {
  label?: string;
}

export type DateStyle = Intl.DateTimeFormatOptions['dateStyle'];
export type TimeStyle = Intl.DateTimeFormatOptions['timeStyle'];

const DEFAULT_DATE_STYLE: DateStyle = 'short';
const DEFAULT_TIME_STYLE: TimeStyle = 'short';

export const DATE_STYLES = new Map<DateStyle, DateFormatPreset>([
  ['short', { label: 'Short' }],
  ['medium', { label: 'Medium' }],
  ['long', { label: 'Long' }],
  ['full', { label: 'Full' }],
]);

export const TIME_STYLES = new Map<TimeStyle, DateFormatPreset>([
  ['short', { label: 'Short' }],
  ['medium', { label: 'Medium' }],
  ['long', { label: 'Long' }],
  ['full', { label: 'Full' }],
]);

const DATE_FORMATS = new Map<DateStyle, Intl.DateTimeFormat>(
  (['short', 'medium', 'long', 'full'] as const).map((dateStyle) => [
    dateStyle,
    new Intl.DateTimeFormat(undefined, { dateStyle }),
  ]),
);

const TIME_FORMATS = new Map<DateStyle, Intl.DateTimeFormat>(
  (['short', 'medium', 'long', 'full'] as const).map((timeStyle) => [
    timeStyle,
    new Intl.DateTimeFormat(undefined, { timeStyle }),
  ]),
);

// Constructing a demo date whether the time is 12h or 24h.
const DEMO_DATE = new Date();
DEMO_DATE.setHours(13);
DEMO_DATE.setMinutes(28);
DEMO_DATE.setSeconds(54);

export interface DateFormat {
  kind: 'shorthand';
  dateStyle?: DateStyle;
  timeStyle?: TimeStyle;
}

export function createFormat(dateFormat?: DateFormat) {
  if (!dateFormat) {
    return new Intl.DateTimeFormat(undefined, {});
  }
  switch (dateFormat.kind) {
    case 'shorthand': {
      const { dateStyle, timeStyle } = dateFormat;
      return new Intl.DateTimeFormat(undefined, { dateStyle, timeStyle });
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
        value={value?.dateStyle || DEFAULT_DATE_STYLE}
        disabled={disabled}
        onChange={(event) => {
          let dateFormat: DateFormat | undefined;

          if (event.target.value) {
            dateFormat = {
              kind: 'shorthand',
              dateStyle: event.target.value as DateStyle,
              timeStyle: disableTimeFormat ? undefined : value?.timeStyle || DEFAULT_TIME_STYLE,
            };
          }

          onChange(dateFormat);
        }}
      >
        {Array.from(DATE_STYLES, ([type, preset]) => (
          <MenuItem key={type} value={type}>
            {DATE_FORMATS.get(type)?.format(DEMO_DATE) || preset.label || type}
          </MenuItem>
        ))}
      </TextField>
      {disableTimeFormat ? null : (
        <TextField
          select
          fullWidth
          label={label ?? 'Time format'}
          value={value?.timeStyle || DEFAULT_TIME_STYLE}
          disabled={disabled}
          onChange={(event) => {
            let dateFormat: DateFormat | undefined;

            if (event.target.value) {
              dateFormat = {
                kind: 'shorthand',
                dateStyle: value?.dateStyle || DEFAULT_DATE_STYLE,
                timeStyle: event.target.value as TimeStyle,
              };
            }

            onChange(dateFormat);
          }}
        >
          {Array.from(TIME_STYLES, ([type, preset]) => (
            <MenuItem key={type} value={type}>
              {TIME_FORMATS.get(type)?.format(DEMO_DATE) || preset.label || type}
            </MenuItem>
          ))}
        </TextField>
      )}
    </Stack>
  );
}
