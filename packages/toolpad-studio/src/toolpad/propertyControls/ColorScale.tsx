import * as React from 'react';
import { ColorScale, ColorScaleStop } from '@toolpad/studio-components';
import {
  Box,
  Stack,
  Popover,
  Button,
  IconButton,
  List,
  ListItem,
  Input,
  ListItemProps,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { EditorProps } from '../../types';
import PropertyControl from '../../components/PropertyControl';
import { ColorPickerIconButton } from '../../components/ColorPicker';
import FlexFill from '../../components/FlexFill';

const EMPTY_STOPS: ColorScaleStop[] = [];

interface ColorScaleListItemProps extends Omit<ListItemProps, 'onChange' | 'value'> {
  valueLabel?: string;
  value?: ColorScaleStop;
  onChange?: (newValue: ColorScaleStop) => void;
  onDelete?: (event: React.MouseEvent) => void;
}

function ColorScaleListItem({
  valueLabel,
  value,
  onChange,
  sx,
  onDelete,
  ...props
}: ColorScaleListItemProps) {
  return (
    <ListItem {...props} sx={{ ...sx, gap: 1 }}>
      {valueLabel ? (
        <Typography>{valueLabel}</Typography>
      ) : (
        <React.Fragment>
          &gt;
          <Input
            type="number"
            value={value?.value ?? 0}
            onChange={(event) => onChange?.({ ...value, value: Number(event.target.value) })}
          />
        </React.Fragment>
      )}
      <FlexFill />
      <ColorPickerIconButton
        value={value?.color}
        onChange={(newValue: string | undefined) => {
          if (newValue) {
            onChange?.({ value: 0, ...value, color: newValue });
          }
        }}
      />
      <IconButton
        onClick={onDelete}
        size="small"
        sx={{ visibility: onDelete ? 'visible' : 'hidden' }}
      >
        <DeleteIcon fontSize="inherit" />
      </IconButton>
    </ListItem>
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

  const stopsOrder: number[] = React.useMemo(() => getOrderedIndices(stops), [stops]);

  const handleRemoveStop = (toRemoveIndex: number) => (event: React.MouseEvent) => {
    event.stopPropagation();
    const newStops = stops.filter((existingStop, index) => index !== toRemoveIndex);

    onChange({
      ...value,
      stops: newStops,
    });
  };

  const handleStopChange = (toChangeIndex: number) => (newValue: ColorScaleStop) => {
    onChange({
      ...value,
      stops: stops.map((existingStop, index) =>
        index === toChangeIndex ? newValue : existingStop,
      ),
    });
  };

  const handleAddStop = () => {
    const lastStop: ColorScaleStop | undefined =
      stops.length > 0 ? stops[stops.length - 1] : undefined;
    const newStop = lastStop ? { ...lastStop, value: lastStop.value + 10 } : { value: 10 };
    onChange({
      ...value,
      stops: [...stops, newStop],
    });
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
          <List sx={{ width: 300 }}>
            <ColorScaleListItem
              valueLabel="Base color"
              value={value?.base ? { value: -Infinity, color: value.base } : undefined}
              onChange={({ color }) => onChange({ ...value, base: color })}
            />
            {stopsOrder.map((index) => {
              const stop = stops[index];
              return (
                <ColorScaleListItem
                  key={index}
                  value={stop}
                  onChange={handleStopChange(index)}
                  onDelete={handleRemoveStop(index)}
                />
              );
            })}
          </List>
        </Box>
        <Button startIcon={<AddIcon />} onClick={handleAddStop}>
          Add Stop
        </Button>
      </Box>
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
        <Box sx={{ minWidth: 300, p: 1 }}>
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
