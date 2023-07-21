import * as React from 'react';
import {
  Autocomplete,
  Box,
  Button,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  MenuItem,
  Popover,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { CHART_DATA_SERIES_KINDS, type ChartDataSeries } from '@mui/toolpad-components';
import { useBrowserJsRuntime } from '@mui/toolpad-core/jsBrowserRuntime';
import DeleteIcon from '@mui/icons-material/Delete';
import { BindableAttrValue } from '@mui/toolpad-core';
import ScatterPlotIcon from '@mui/icons-material/ScatterPlot';
import BarChartIcon from '@mui/icons-material/BarChart';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import LegendToggleIcon from '@mui/icons-material/LegendToggle';
import * as appDom from '../../appDom';
import type { EditorProps } from '../../types';
import PropertyControl from '../../components/PropertyControl';
import { usePageEditorState } from '../AppEditor/PageEditor/PageEditorProvider';
import { useDom, useDomApi } from '../AppState';
import BindableEditor from '../AppEditor/PageEditor/BindableEditor';
import { updateArray, remove } from '../../utils/immutability';
import { createToolpadAppTheme } from '../../runtime/AppThemeProvider';
import ColorPicker from '../../components/ColorPicker';

const CHART_KIND_OPTIONS: {
  kind: (typeof CHART_DATA_SERIES_KINDS)[number];
  icon: React.ComponentType;
}[] = [
  { kind: 'line', icon: ShowChartIcon },
  { kind: 'bar', icon: BarChartIcon },
  { kind: 'area', icon: LegendToggleIcon },
  { kind: 'scatter', icon: ScatterPlotIcon },
];

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

  const appTheme = React.useMemo(() => createToolpadAppTheme(dom), [dom]);

  const node = nodeId ? (appDom.getMaybeNode(dom, nodeId) as appDom.ElementNode) : null;

  const [dataSeriesEditIndex, setDataSeriesEditIndex] = React.useState<number | null>(null);
  const [popoverAnchorElement, setPopoverAnchorElement] = React.useState<HTMLElement | null>(null);

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
          color: appTheme.palette.primary.main,
        },
      ]);
    }
  }, [appTheme, node, onChange, value]);

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

  const isPopoverOpen = Boolean(popoverAnchorElement);

  const handlePopoverClose = React.useCallback(() => {
    setPopoverAnchorElement(null);
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

  const handleDataSeriesAutocompletePropChange = React.useCallback(
    (index: number, propName: string) => (event: React.SyntheticEvent, newValue: string) => {
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

  const dataSeriesKeySuggestions = React.useMemo(
    () =>
      value.map((dataSeries) => {
        const allKeys = (dataSeries.data || []).flatMap((dataSeriesPoint) =>
          Object.keys(dataSeriesPoint),
        );

        return allKeys.filter((key, index) => allKeys.indexOf(key) === index);
      }),
    [value],
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
                {CHART_KIND_OPTIONS.map((option) => (
                  <MenuItem key={option.kind} value={option.kind}>
                    <Stack direction="row" alignItems="center">
                      <option.icon />
                      <ListItemText sx={{ ml: 1 }}>{option.kind}</ListItemText>
                    </Stack>
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
              <Autocomplete
                freeSolo
                options={dataSeriesKeySuggestions[dataSeriesEditIndex]}
                value={editDataSeries?.xKey}
                onInputChange={handleDataSeriesAutocompletePropChange(dataSeriesEditIndex, 'xKey')}
                renderInput={(params) => <TextField {...params} label="xKey" />}
              />
              <Autocomplete
                freeSolo
                options={dataSeriesKeySuggestions[dataSeriesEditIndex]}
                value={editDataSeries?.yKey}
                onInputChange={handleDataSeriesAutocompletePropChange(dataSeriesEditIndex, 'yKey')}
                renderInput={(params) => <TextField {...params} label="yKey" />}
              />
              <ColorPicker
                label="color"
                value={editDataSeries?.color}
                onChange={handleDataSeriesColorChange(dataSeriesEditIndex)}
              />
            </Stack>
          </Box>
        ) : null}
      </Popover>
    </React.Fragment>
  );
}

export default ChartDataPropEditor;
