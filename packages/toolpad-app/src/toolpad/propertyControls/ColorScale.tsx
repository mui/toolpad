import * as React from 'react';
import { ColorScale } from '@mui/toolpad-components';
import {
  Box,
  Stack,
  Popover,
  Button,
  TextField,
  Typography,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import { ColorScaleStop } from '@mui/toolpad-components/dist/Statistic';
import { EditorProps } from '../../types';
import PropertyControl from '../../components/PropertyControl';
import ColorPicker from '../../components/ColorPicker';
import FlexFill from '../../components/FlexFill';

const EMPTY_STOPS: ColorScaleStop[] = [];

interface ColorScaleToggleButtonProps {
  label?: string;
  color?: string;
}

function ColorScaleToggleButton({ label, color }: ColorScaleToggleButtonProps) {
  return (
    <React.Fragment>
      <Typography>{label}</Typography>
      <FlexFill />
      <Box
        sx={{
          background: color,
          width: 24,
          height: 24,
          borderRadius: '50%',
          boxShadow: 1,
        }}
      />
    </React.Fragment>
  );
}

interface ColorScaleEditorProps {
  value?: ColorScale;
  onChange: (value?: ColorScale) => void;
}

function ColorScaleEditor({ value, onChange }: ColorScaleEditorProps) {
  const stops: ColorScaleStop[] = value?.stops ?? EMPTY_STOPS;

  const [activeStop, setActiveStop] = React.useState<number | 'base'>('base');

  const colorStopValue = activeStop === 'base' ? null : stops[activeStop]?.value;
  const stopColor = activeStop === 'base' ? value?.base : stops[activeStop]?.color;

  const handleStopColorChange = (newValue: string | undefined) => {
    if (newValue) {
      if (activeStop === 'base') {
        onChange({ stops: [], ...value, base: newValue });
      } else {
        onChange({
          ...value,
          stops: stops.map((existingStop, index) => {
            return index === activeStop ? { ...existingStop, color: newValue } : existingStop;
          }),
        });
      }
    }
  };

  const handleStopValueChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = Number(event.target.value);
    if (!Number.isNaN(newValue) && activeStop !== 'base') {
      onChange({
        ...value,
        stops: stops.map((existingStop, index) => {
          return index === activeStop ? { ...existingStop, value: newValue } : existingStop;
        }),
      });
    }
  };

  const stopsOrder: number[] = React.useMemo(() => {
    return stops
      .map((stop, index) => {
        return { index, value: stop.value };
      })
      .sort((stop1, stop2) => stop1.value - stop2.value)
      .map(({ index }) => index);
  }, [stops]);

  const handleRemoveStop = () => {
    if (activeStop !== 'base') {
      onChange({
        ...value,
        stops: stops.filter((existingStop, index) => index !== activeStop),
      });
      setActiveStop('base');
    }
  };
  const handleAddStop = () => {
    const lastStop: ColorScaleStop | undefined =
      stops.length > 0 ? stops[stops.length - 1] : undefined;
    const newStop = lastStop ? { ...lastStop, value: lastStop.value + 10 } : { value: 10 };
    onChange({
      ...value,
      stops: [...stops, newStop],
    });
    setActiveStop(stops.length);
  };

  return (
    <Stack sx={{ height: 300 }} spacing={1} direction="row">
      <ToggleButtonGroup
        orientation="vertical"
        value={activeStop}
        exclusive
        onChange={(event, newValue) => setActiveStop(newValue)}
      >
        <ToggleButton value="base">
          <ColorScaleToggleButton color={value?.base} />
        </ToggleButton>
        {stopsOrder.map((index) => {
          const stop = stops[index];
          return (
            <ToggleButton key={index} value={index}>
              <ColorScaleToggleButton color={stop.color} label={`> ${stop.value}`} />
            </ToggleButton>
          );
        })}
      </ToggleButtonGroup>
      <Stack direction="column">
        {activeStop === 'base' ? null : (
          <TextField value={colorStopValue} onChange={handleStopValueChange} type="number" />
        )}
        <ColorPicker value={stopColor} onChange={handleStopColorChange} />
        <Button onClick={handleAddStop}>Add Stop</Button>
        <Button onClick={handleRemoveStop}>Remove Stop</Button>
      </Stack>
    </Stack>
  );
}

export type ColorScaleProps = EditorProps<ColorScale>;

export default function ColorScaleControl({ label, propType, value, onChange }: ColorScaleProps) {
  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(null);

  const handlePopoverClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handlePopoverClose = () => {
    setAnchorEl(null);
  };
  const open = Boolean(anchorEl);
  const popoverIdValue = React.useId();
  const popoverId = open ? popoverIdValue : undefined;

  return (
    <React.Fragment>
      <PropertyControl propType={propType}>
        <Button aria-describedby={popoverId} onClick={handlePopoverClick}>
          {label}
        </Button>
      </PropertyControl>
      <Popover
        id={popoverId}
        open={open}
        anchorEl={anchorEl}
        onClose={handlePopoverClose}
        anchorOrigin={{
          vertical: 'center',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'center',
          horizontal: 'left',
        }}
      >
        <Box sx={{ minWidth: 300, p: 2 }}>
          <ColorScaleEditor
            value={value}
            onChange={(newValue) => {
              onChange(newValue);
            }}
          />
        </Box>
      </Popover>
    </React.Fragment>
  );
}
