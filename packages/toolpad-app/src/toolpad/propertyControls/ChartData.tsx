import * as React from 'react';
import {
  Box,
  Button,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  MenuItem,
  Popover,
  Stack,
  TextField,
  Typography,
  useTheme,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { CHART_DATA_SERIES_KINDS, type ChartDataSeries } from '@mui/toolpad-components';
import { useBrowserJsRuntime } from '@mui/toolpad-core/jsBrowserRuntime';
import DeleteIcon from '@mui/icons-material/Delete';
import { BindableAttrValue } from '@mui/toolpad-core';
import * as appDom from '../../appDom';
import type { EditorProps } from '../../types';
import PropertyControl from '../../components/PropertyControl';
import { usePageEditorState } from '../AppEditor/PageEditor/PageEditorProvider';
import { useDom, useDomApi } from '../AppState';
// eslint-disable-next-line import/no-cycle
import BindableEditor from '../AppEditor/PageEditor/BindableEditor';
import { updateArray, remove } from '../../utils/immutability';
import FlexFill from '../../components/FlexFill';
import ColorTool from '../../components/ColorTool';

function ChartDataPropEditor({
  nodeId,
  propType,
  value = [],
  onChange,
}: EditorProps<ChartDataSeries[]>) {
  const { dom } = useDom();
  const domApi = useDomApi();
  const { pageState, bindings, globalScopeMeta } = usePageEditorState();
  const jsBrowserRuntime = useBrowserJsRuntime();

  const theme = useTheme();

  const node = nodeId ? (appDom.getMaybeNode(dom, nodeId) as appDom.ElementNode) : null;

  const [dataSeriesEditIndex, setDataSeriesEditIndex] = React.useState<number | null>(null);
  const [popoverAnchorElement, setPopoverAnchorElement] = React.useState<HTMLElement | null>(null);
  const [colorPopoverAnchorElement, setColorPopoverAnchorElement] =
    React.useState<HTMLElement | null>(null);

  const handleAddDataSeries = React.useCallback(() => {
    if (node) {
      const newDataSeriesLabel = `dataSeries${value.length + 1}`;

      onChange([
        ...value,
        {
          kind: 'line',
          label: newDataSeriesLabel,
          data: [],
          xKey: 'x',
          yKey: 'y',
        },
      ]);
    }
  }, [node, onChange, value]);

  const handleDataSeriesClick = React.useCallback(
    (index: number) => (event: React.MouseEvent<HTMLElement>) => {
      setDataSeriesEditIndex(index);
      setPopoverAnchorElement(event.currentTarget);
    },
    [],
  );

  const handleRemoveDataSeries = React.useCallback(
    (index: number) => () => {
      onChange(remove(value, index));
    },
    [onChange, value],
  );

  const popoverId = React.useId();
  const colorPopoverId = React.useId();

  const isPopoverOpen = Boolean(popoverAnchorElement);
  const isColorPopoverOpen = Boolean(colorPopoverAnchorElement);

  const handlColorClick = React.useCallback((event: React.MouseEvent<HTMLElement>) => {
    setColorPopoverAnchorElement(event.currentTarget);
  }, []);

  const handlePopoverClose = React.useCallback(() => {
    setPopoverAnchorElement(null);
  }, []);

  const handleColorPopoverClose = React.useCallback(() => {
    setColorPopoverAnchorElement(null);
  }, []);

  const updateDataSeriesProp = React.useCallback(
    (index: number, newValue: unknown, propName: string, defaultValue: unknown = '') => {
      if (node) {
        const previousData = node.props?.data || [];

        domApi.update((draft) =>
          appDom.setNodeNamespacedProp(
            draft,
            node,
            'props',
            'data',
            updateArray(
              previousData,
              {
                ...previousData[index],
                [propName]: newValue || defaultValue,
              },
              index,
            ),
          ),
        );
      }
    },
    [domApi, node],
  );

  const handleDataSeriesDataChange = React.useCallback(
    (index: number) => (newValue: BindableAttrValue<ChartDataSeries['data']> | null) => {
      updateDataSeriesProp(index, newValue, 'data', []);
    },
    [updateDataSeriesProp],
  );

  const handleDataSeriesTextInputPropChange = React.useCallback(
    (index: number, propName: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = event.target.value;
      updateDataSeriesProp(index, newValue, propName);
    },
    [updateDataSeriesProp],
  );

  const handleDataSeriesColorChange = React.useCallback(
    (index: number) => (newValue: string | undefined) => {
      updateDataSeriesProp(index, newValue, 'color');
    },
    [updateDataSeriesProp],
  );

  if (!node) {
    return null;
  }

  const editDataSeries = dataSeriesEditIndex !== null ? value[dataSeriesEditIndex] : null;

  return (
    <React.Fragment>
      <PropertyControl propType={propType}>
        <Box>
          <List sx={{ mb: 1 }}>
            {value.map((dataSeries, index) => {
              const { label } = dataSeries;

              return (
                <ListItem key={index} disableGutters>
                  <ListItemButton
                    onClick={handleDataSeriesClick(index)}
                    aria-describedby={popoverId}
                  >
                    <ListItemText primary={label} />
                  </ListItemButton>
                  <IconButton
                    aria-label="Delete data series"
                    onClick={handleRemoveDataSeries(index)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </ListItem>
              );
            })}
          </List>
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            fullWidth
            onClick={handleAddDataSeries}
          >
            Add data series
          </Button>
        </Box>
      </PropertyControl>
      <Popover
        id={popoverId}
        open={isPopoverOpen}
        anchorEl={popoverAnchorElement}
        onClose={handlePopoverClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
      >
        {editDataSeries && dataSeriesEditIndex !== null ? (
          <Box sx={{ minWidth: 300, p: 2 }}>
            <Typography variant="body1" sx={{ mb: 1 }}>
              {editDataSeries.label}
            </Typography>
            <Stack gap={1} py={1}>
              <TextField
                label="label"
                value={editDataSeries?.label}
                onChange={handleDataSeriesTextInputPropChange(dataSeriesEditIndex, 'label')}
              />
              <TextField
                select
                label="kind"
                value={editDataSeries?.kind}
                onChange={handleDataSeriesTextInputPropChange(dataSeriesEditIndex, 'kind')}
              >
                {CHART_DATA_SERIES_KINDS.map((kind) => (
                  <MenuItem key={kind} value={kind}>
                    {kind}
                  </MenuItem>
                ))}
              </TextField>
              <BindableEditor
                liveBinding={bindings[`${nodeId}.props.data[${dataSeriesEditIndex}].data`]}
                globalScope={pageState}
                globalScopeMeta={globalScopeMeta}
                label="data"
                jsRuntime={jsBrowserRuntime}
                propType={{ type: 'array' }}
                value={editDataSeries?.data ?? null}
                onChange={handleDataSeriesDataChange(dataSeriesEditIndex)}
              />
              <TextField
                label="xKey"
                value={editDataSeries?.xKey}
                onChange={handleDataSeriesTextInputPropChange(dataSeriesEditIndex, 'xKey')}
              />
              <TextField
                label="yKey"
                value={editDataSeries?.yKey}
                onChange={handleDataSeriesTextInputPropChange(dataSeriesEditIndex, 'yKey')}
              />
              <Button
                aria-describedby={colorPopoverId}
                variant="outlined"
                color="inherit"
                fullWidth
                onClick={handlColorClick}
              >
                color
                <FlexFill />
                <Box
                  sx={{
                    ml: 2,
                    p: '2px 8px',
                    background: editDataSeries?.color,
                    color: editDataSeries?.color
                      ? theme.palette.getContrastText(editDataSeries.color)
                      : undefined,
                    borderRadius: 1,
                  }}
                >
                  {editDataSeries?.color}
                </Box>
              </Button>
              <Popover
                id={isColorPopoverOpen ? colorPopoverId : undefined}
                open={isColorPopoverOpen}
                anchorEl={colorPopoverAnchorElement}
                onClose={handleColorPopoverClose}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'left',
                }}
              >
                <ColorTool
                  sx={{ m: 2 }}
                  label="color"
                  value={editDataSeries?.color}
                  onChange={handleDataSeriesColorChange(dataSeriesEditIndex)}
                />
              </Popover>
            </Stack>
          </Box>
        ) : null}
      </Popover>
    </React.Fragment>
  );
}

export default ChartDataPropEditor;
