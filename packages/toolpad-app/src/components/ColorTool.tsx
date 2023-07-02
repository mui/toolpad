import * as React from 'react';
import { rgbToHex, useTheme } from '@mui/material/styles';
import * as colors from '@mui/material/colors';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Input from '@mui/material/Input';
import Radio, { RadioProps } from '@mui/material/Radio';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import CheckIcon from '@mui/icons-material/Check';
import Slider from '@mui/material/Slider';
import invariant from 'invariant';

const isRgb = (string: string) =>
  /rgb\([0-9]{1,3}\s*,\s*[0-9]{1,3}\s*,\s*[0-9]{1,3}\)/i.test(string);

const isHex = (string: string) => /^#?([0-9a-f]{3})$|^#?([0-9a-f]){6}$/i.test(string);

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

const TooltipRadio = React.forwardRef<HTMLButtonElement, TooltipRadioProps>(function TooltipRadio(
  props,
  ref,
) {
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
});

export interface ColorToolProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

function ColorTool({ label, value, onChange }: ColorToolProps) {
  const theme = useTheme();

  const [state, setState] = React.useState<{
    input: string;
    hue: keyof typeof colors;
    shade: number;
  }>({
    input: value,
    hue: 'blue',
    shade: 4,
  });

  const handleChangeColor = (event: React.ChangeEvent<HTMLInputElement>) => {
    let {
      target: { value: color },
    } = event;

    setState((oldState) => ({
      ...oldState,
      input: color,
    }));

    let isValidColor = false;

    if (isRgb(color)) {
      isValidColor = true;
    } else if (isHex(color)) {
      isValidColor = true;
      if (color.indexOf('#') === -1) {
        color = `#${color}`;
      }
    }

    if (isValidColor) {
      onChange(color);
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
      onChange(color);
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
      onChange(color);
    }
  };

  const intentInput = state.input;
  const intentShade = state.shade;
  const color = value;

  const background = theme.palette.augmentColor({
    color: {
      main: color,
    },
  });

  const id = React.useId();

  return (
    <Grid item xs={12} sm={6} md={4}>
      <Typography component="label" gutterBottom htmlFor={id} variant="h6">
        {label}
      </Typography>
      <Input id={id} value={intentInput} onChange={handleChangeColor} fullWidth />
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
      <Box sx={{ width: 192 }}>
        {hues.map((hue) => {
          const shade = shades[state.shade];
          const backgroundColor = colors[hue][shade];

          return (
            <Tooltip placement="right" title={hue} key={hue}>
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
      <Grid container sx={{ mt: 2 }}>
        {(['dark', 'main', 'light'] as const).map((key) => (
          <Box
            sx={{
              width: 64,
              height: 64,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
            style={{ backgroundColor: background[key] }}
            key={key}
          >
            <Typography
              variant="caption"
              style={{
                color: theme.palette.getContrastText(background[key]),
              }}
            >
              {rgbToHex(background[key])}
            </Typography>
          </Box>
        ))}
      </Grid>
    </Grid>
  );
}

export default ColorTool;
