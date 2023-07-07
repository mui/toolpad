import * as React from 'react';
import { ColorScale, ColorScaleStop } from '@mui/toolpad-components';
import {
  Box,
  Stack,
  Popover,
  Button,
  TextField,
  Typography,
  ToggleButton,
  ToggleButtonGroup,
  ToggleButtonProps,
  IconButton,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { EditorProps } from '../../types';
import PropertyControl from '../../components/PropertyControl';
import ColorPicker from '../../components/ColorPicker';

const EMPTY_STOPS: ColorScaleStop[] = [];

interface ColorScaleToggleButtonProps extends ToggleButtonProps {
  label?: string;
  stopColor?: string;
  onDelete?: (event: React.MouseEvent) => void;
}

function ColorScaleToggleButton({
  label,
  stopColor,
  sx,
  onDelete,
  ...props
}: ColorScaleToggleButtonProps) {
  return (
    <ToggleButton
      sx={{
        ...sx,
        px: 1,
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'end',
        gap: 1,
      }}
      {...props}
    >
      <Typography>{label}</Typography>
      <Box
        sx={{
          background: stopColor,
          width: 24,
          height: 24,
          borderRadius: '50%',
          boxShadow: 1,
        }}
      />
      <IconButton
        onClick={onDelete}
        size="small"
        sx={{ visibility: onDelete ? 'visible' : 'hidden' }}
      >
        <DeleteIcon fontSize="inherit" />
      </IconButton>
    </ToggleButton>
  );
}

function getOrderedIndices(stops: ColorScaleStop[]): number[] {
  return stops
    .map((stop, index) => {
      return { index, value: stop.value };
    })
    .sort((stop1, stop2) => stop1.value - stop2.value)
    .map(({ index }) => index);
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

  const stopsOrder: number[] = React.useMemo(() => getOrderedIndices(stops), [stops]);

  const handleRemoveStop = (toRemoveIndex: number) => (event: React.MouseEvent) => {
    event.stopPropagation();
    const orderedIndex = stopsOrder.indexOf(toRemoveIndex);
    let activeStopAfterRemoval: 'base' | number = 'base';
    const newStops = stops.filter((existingStop, index) => index !== toRemoveIndex);

    if (newStops.length > 0) {
      const newOrder = getOrderedIndices(newStops);
      activeStopAfterRemoval = newOrder[orderedIndex] ?? newOrder[orderedIndex - 1];
    }

    onChange({
      ...value,
      stops: newStops,
    });
    setActiveStop(activeStopAfterRemoval);
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
    <Stack spacing={1} direction="row">
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 1,
        }}
      >
        <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
          <ToggleButtonGroup
            orientation="vertical"
            value={activeStop}
            exclusive
            onChange={(event, newValue) => setActiveStop(newValue)}
          >
            <ColorScaleToggleButton value="base" stopColor={value?.base} />
            {stopsOrder.map((index) => {
              const stop = stops[index];
              return (
                <ColorScaleToggleButton
                  key={index}
                  value={index}
                  stopColor={stop.color}
                  label={`> ${stop.value}`}
                  onDelete={handleRemoveStop(index)}
                />
              );
            })}
          </ToggleButtonGroup>
        </Box>
        <Button startIcon={<AddIcon />} onClick={handleAddStop}>
          Add Stop
        </Button>
      </Box>
      <Stack direction="column">
        {activeStop === 'base' ? null : (
          <TextField value={colorStopValue} onChange={handleStopValueChange} type="number" />
        )}
        <ColorPicker value={stopColor} onChange={handleStopColorChange} />
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
