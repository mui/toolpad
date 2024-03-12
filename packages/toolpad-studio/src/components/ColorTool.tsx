import * as React from 'react';
import { SxProps, rgbToHex, useTheme } from '@mui/material/styles';
import * as colors from '@mui/material/colors';
import Box from '@mui/material/Box';
import Input from '@mui/material/Input';
import Radio, { RadioProps } from '@mui/material/Radio';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import CheckIcon from '@mui/icons-material/Check';
import Slider from '@mui/material/Slider';
import invariant from 'invariant';
import { Stack } from '@mui/material';

const isRgb = (string: string) =>
  /rgb\([0-9]{1,3}\s*,\s*[0-9]{1,3}\s*,\s*[0-9]{1,3}\)/i.test(string);

const isHex = (string: string) => /^#?([0-9a-f]{3})$|^#?([0-9a-f]){6}$/i.test(string);

export function parseColor(color: string): string | null {
  if (isRgb(color)) {
    return color;
  }
  if (isHex(color)) {
    if (!color.startsWith('#')) {
      return `#${color}`;
    }
    return color;
  }
  return null;
}

const hues = [
  'red',
  'pink',
  'purple',
  'deepPurple',
  'indigo',
  'blue',
  'lightBlue',
  'cyan',
  'teal',
  'green',
  'lightGreen',
  'lime',
  'yellow',
  'amber',
  'orange',
  'deepOrange',
] as const;

const shades = [
  900,
  800,
  700,
  600,
  500,
  400,
  300,
  200,
  100,
  50,
  'A700',
  'A400',
  'A200',
  'A100',
] as const;

type Shade = (typeof shades)[number];

interface TooltipRadioProps extends RadioProps {
  'aria-label'?: string;
  'aria-labelledby'?: string;
  inputProps?: RadioProps['inputProps'];
}

const TooltipRadio = React.forwardRef<HTMLButtonElement, TooltipRadioProps>(
  function TooltipRadio(props, ref) {
    const {
      'aria-labelledby': ariaLabelledBy,
      'aria-label': ariaLabel,
      inputProps,
      ...other
    } = props;

    return (
      <Radio
        ref={ref}
        {...other}
        inputProps={{
          ...inputProps,
          'aria-labelledby': ariaLabelledBy,
          'aria-label': ariaLabel,
        }}
      />
    );
  },
);

export interface ColorToolProps {
  label?: string;
  value?: string;
  onChange?: (value?: string) => void;
  sx?: SxProps;
}

function ColorTool({ sx, label, value, onChange }: ColorToolProps) {
  const theme = useTheme();

  const [state, setState] = React.useState<{
    input?: string;
    hue: keyof typeof colors;
    shade: number;
    valid: boolean;
  }>({
    input: value,
    hue: 'blue',
    shade: 4,
    valid: true,
  });

  const handleChangeColor = (event: React.ChangeEvent<HTMLInputElement>) => {
    let {
      target: { value: color },
    } = event;

    const parsed = parseColor(color);
    const valid = !!parsed;
    if (parsed) {
      color = parsed;
    }

    setState((oldState) => ({
      ...oldState,
      input: color,
      valid,
    }));

    if (valid) {
      onChange?.(color);
    }
  };

  const handleChangeHue = (event: React.ChangeEvent<HTMLInputElement>) => {
    const hue = event.target.value as keyof typeof colors;
    const color = (colors[hue] as Record<Shade, string | undefined>)[shades[state.shade]];

    if (color) {
      setState({
        ...state,
        hue,
        input: color,
      });
      onChange?.(color);
    }
  };

  const handleChangeShade = (event: Event, shade: number | number[]) => {
    invariant(!Array.isArray(shade), 'Material-UI: `shade` must not be an array.');

    const color = (colors[state.hue] as Record<Shade, string | undefined>)[shades[shade]];

    if (color) {
      setState({
        ...state,
        shade,

        input: color,
      });
      onChange?.(color);
    }
  };

  const intentInput = state.input;
  const intentShade = state.shade;
  const color = value;

  const background = color
    ? theme.palette.augmentColor({
        color: {
          main: color,
        },
      })
    : undefined;

  const id = React.useId();

  return (
    <Box sx={sx}>
      <Typography component="label" gutterBottom htmlFor={id} variant="h6">
        {label}
      </Typography>
      <Input
        id={id}
        value={intentInput}
        onChange={handleChangeColor}
        fullWidth
        error={!state.valid}
      />
      <Box sx={{ display: 'flex', alignItems: 'center', mt: 2, mb: 2 }}>
        <Typography id={`${id}ShadeSliderLabel`}>Shade:</Typography>
        <Slider
          sx={{ width: 'calc(100% - 80px)', ml: 3, mr: 3 }}
          value={intentShade}
          min={0}
          max={13}
          step={1}
          onChange={handleChangeShade}
          aria-labelledby={`${id}ShadeSliderLabel`}
        />
        <Typography>{shades[intentShade]}</Typography>
      </Box>
      <Box sx={{ width: 192, margin: 'auto' }}>
        {hues.map((hue) => {
          const shade = shades[state.shade];
          const backgroundColor = colors[hue][shade];

          return (
            <Tooltip placement="right" title={hue} key={hue} disableInteractive>
              <TooltipRadio
                sx={{ p: 0 }}
                color="default"
                checked={color === backgroundColor}
                onChange={handleChangeHue}
                value={hue}
                name={label}
                icon={<Box sx={{ width: 48, height: 48 }} style={{ backgroundColor }} />}
                checkedIcon={
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      border: 1,
                      borderColor: 'white',
                      color: 'common.white',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                    style={{ backgroundColor }}
                  >
                    <CheckIcon style={{ fontSize: 30 }} />
                  </Box>
                }
              />
            </Tooltip>
          );
        })}
      </Box>
      <Stack direction="row" sx={{ mt: 2, justifyContent: 'center' }}>
        {(['dark', 'main', 'light'] as const).map((key) => (
          <Box
            sx={{
              width: 64,
              height: 64,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
            style={{ backgroundColor: background?.[key] }}
            key={key}
          >
            <Typography
              variant="caption"
              style={{
                color: background ? theme.palette.getContrastText(background[key]) : undefined,
              }}
            >
              {background ? rgbToHex(background[key]) : ''}
            </Typography>
          </Box>
        ))}
      </Stack>
    </Box>
  );
}

export default ColorTool;
