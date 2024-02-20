import * as React from 'react';
import type { JSONSchema7 } from 'json-schema';
import { TextField, MenuItem, SxProps, Stack, styled, Box } from '@mui/material';

const ACCEPTABLE_CURRENCY_REGEX = /^[a-zA-Z]{3}$/;

export const CURRENCY_CODES_LIST_HELP_URL =
  'https://en.wikipedia.org/wiki/ISO_4217#List_of_ISO_4217_currency_codes';

export type NumberFormat =
  | {
      kind: 'preset';
      preset: string;
    }
  | {
      kind: 'currency';
      currency?: string;
    }
  | {
      kind: 'custom';
      custom: Intl.NumberFormatOptions;
    };

export const NUMBER_FORMAT_SCHEMA: JSONSchema7 = {
  anyOf: [
    {
      type: 'object',
      properties: {
        kind: {
          type: 'string',
          const: 'preset',
        },
        preset: {
          type: 'string',
        },
      },
      required: ['kind', 'preset'],
    },
    {
      type: 'object',
      properties: {
        kind: {
          type: 'string',
          const: 'currency',
        },
        currency: {
          type: 'string',
        },
      },
      required: ['kind', 'currency'],
    },
    {
      type: 'object',
      properties: {
        kind: {
          type: 'string',
          const: 'custom',
        },
        custom: {
          type: 'object',
          properties: {
            compactDisplay: { type: 'string', enum: ['short', 'long'] },
            notation: {
              type: 'string',
              enum: ['standard', 'scientific', 'engineering', 'compact'],
            },
            signDisplay: { type: 'string', enum: ['auto', 'never', 'always', 'exceptZero'] },
            unit: { type: 'string' },
            unitDisplay: { type: 'string', enum: ['short', 'long', 'narrow'] },
            currencyDisplay: { type: 'string' },
            currencySign: { type: 'string' },
          },
          required: [],
        },
      },
      required: ['kind', 'custom'],
    },
  ],
};

export interface NumberFormatPreset {
  label?: string;
  options?: Intl.NumberFormatOptions;
}

export const NUMBER_FORMAT_PRESETS = new Map<string, NumberFormatPreset>([
  [
    'bytes',
    {
      label: 'Bytes',
      options: {
        style: 'unit',
        maximumSignificantDigits: 3,
        notation: 'compact',
        unit: 'byte',
        unitDisplay: 'narrow',
      },
    },
  ],
  [
    'percent',
    {
      label: 'Percent',
      options: {
        style: 'percent',
      },
    },
  ],
]);

interface NumberFormatterParams {
  value: unknown;
}

export interface NumberFormatter {
  (params: NumberFormatterParams): string;
}

export type PrettyNumberFormat = React.ComponentType<NumberFormatterParams>;

export function createFormat(numberFormat?: NumberFormat): Intl.NumberFormat {
  if (!numberFormat) {
    return new Intl.NumberFormat(undefined, {});
  }
  switch (numberFormat.kind) {
    case 'preset': {
      const preset = NUMBER_FORMAT_PRESETS.get(numberFormat.preset);
      return new Intl.NumberFormat(undefined, preset?.options);
    }
    case 'custom': {
      return new Intl.NumberFormat(undefined, numberFormat.custom);
    }
    case 'currency': {
      const userInput = numberFormat.currency || 'USD';
      return new Intl.NumberFormat(undefined, {
        style: 'currency',
        currency: ACCEPTABLE_CURRENCY_REGEX.test(userInput) ? userInput : 'USD',
      });
    }
    default: {
      return new Intl.NumberFormat();
    }
  }
}

export interface FormattedNumberProps {
  format?: Intl.NumberFormat;
  children: number | string;
}

const PrettyNumberFormatRoot = styled('span')({
  '& .number-token-type-currency, & .number-token-type-percentSign': {
    // This makes the currency/percent symbol a bit smaller than the number, but only on larger font sizes
    fontSize: 'max(1rem, 0.8em)',
  },
});

const DEFAULT_FORMAT = new Intl.NumberFormat();

export function FormattedNumber({ children, format = DEFAULT_FORMAT }: FormattedNumberProps) {
  const parts = React.useMemo(() => format.formatToParts(Number(children)), [children, format]);
  return (
    <PrettyNumberFormatRoot>
      {parts.map((part, i) => (
        <span key={i} className={`number-token-type-${part.type}`}>
          {part.value}
        </span>
      ))}
    </PrettyNumberFormatRoot>
  );
}

function formatNumberOptionValue(numberFormat: NumberFormat | undefined) {
  if (!numberFormat) {
    return 'plain';
  }
  switch (numberFormat.kind) {
    case 'preset':
      return ['preset', numberFormat.preset].join(':');
    case 'custom':
      return 'custom';
    case 'currency':
      return 'currency';
    default:
      return 'plain';
  }
}

export interface NumberFormatEditorProps {
  value?: NumberFormat;
  onChange: (newValue?: NumberFormat) => void;
  disabled?: boolean;
  sx?: SxProps;
  label?: string;
}

export function NumberFormatEditor({
  label,
  disabled,
  value,
  onChange,
  sx,
}: NumberFormatEditorProps) {
  return (
    <Stack sx={sx} gap={1}>
      <TextField
        select
        fullWidth
        label={label ?? 'Number format'}
        value={formatNumberOptionValue(value)}
        disabled={disabled}
        onChange={(event) => {
          let numberFormat: NumberFormat | undefined;

          if (event.target.value === 'currency') {
            numberFormat = {
              kind: 'currency',
              currency: 'USD',
            };
          } else if (event.target.value === 'custom') {
            numberFormat = {
              kind: 'custom',
              custom: {},
            };
          } else if (event.target.value) {
            const [prefix, id] = event.target.value.split(':');

            if (prefix === 'preset') {
              numberFormat = {
                kind: 'preset',
                preset: id,
              };
            }
          }

          onChange(numberFormat);
        }}
      >
        <MenuItem value="plain">Plain</MenuItem>
        {Array.from(NUMBER_FORMAT_PRESETS, ([type, preset]) => (
          <MenuItem key={type} value={`preset:${type}`}>
            {preset.label || type}
          </MenuItem>
        ))}
        <MenuItem value="currency">Currency</MenuItem>
        {/* TODO: Add support for <MenuItem value="custom">custom</MenuItem> */}
      </TextField>

      <Box sx={{ ml: 1, pl: 1, borderLeft: 1, borderColor: 'divider' }}>
        {value?.kind === 'currency' ? (
          <TextField
            fullWidth
            label="currency code"
            value={value.currency}
            disabled={disabled}
            onChange={(event) => {
              onChange({
                ...value,
                kind: 'currency',
                currency: event.target.value,
              });
            }}
            error={!!value.currency && !ACCEPTABLE_CURRENCY_REGEX.test(value.currency)}
            helperText={
              <React.Fragment>
                ISO 4217 currency code. See the{' '}
                <a target="_blank" href={CURRENCY_CODES_LIST_HELP_URL} rel="noopener noreferrer">
                  currency code list
                </a>{' '}
                for available values.
              </React.Fragment>
            }
          />
        ) : null}
      </Box>
    </Stack>
  );
}
