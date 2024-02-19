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
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { BindableAttrValue } from '@mui/toolpad-core';
import ScatterPlotIcon from '@mui/icons-material/ScatterPlot';
import BarChartIcon from '@mui/icons-material/BarChart';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import LegendToggleIcon from '@mui/icons-material/LegendToggle';
import { evaluateBindable } from '@mui/toolpad-core/jsRuntime';
import { blueberryTwilightPalette } from '@mui/x-charts/colorPalettes';
import { updateArray, remove } from '@mui/toolpad-utils/immutability';
import * as appDom from '@mui/toolpad-core/appDom';
import type { EditorProps } from '../../types';
import PropertyControl from '../../components/PropertyControl';
import { usePageEditorState } from '../AppEditor/PageEditor/PageEditorProvider';
import { useAppState, useDomApi } from '../AppState';
import BindableEditor from '../AppEditor/PageEditor/BindableEditor';
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
  const { dom } = useAppState();
  const domApi = useDomApi();
  const { pageState, bindings, globalScopeMeta } = usePageEditorState();
  const jsBrowserRuntime = useBrowserJsRuntime();

  const appTheme = React.useMemo(() => createToolpadAppTheme(dom), [dom]);

  const defaultPalette = blueberryTwilightPalette(appTheme.palette.mode);

  const [dataSeriesEditIndex, setDataSeriesEditIndex] = React.useState<number | null>(null);
  const [popoverAnchorElement, setPopoverAnchorElement] = React.useState<HTMLElement | null>(null);

  const handleAddDataSeries = React.useCallback(() => {
    const newDataSeriesCount = value.length + 1;

    const newDataSeriesLabel = `dataSeries${newDataSeriesCount}`;

    onChange([
      ...value,
      {
        label: newDataSeriesLabel,
        kind: 'line',
        data: [],
        color: defaultPalette[(newDataSeriesCount - 1) % defaultPalette.length],
      },
    ]);
  }, [defaultPalette, onChange, value]);

  const previousDataSeriesCountRef = React.useRef(value.length);
  React.useEffect(() => {
    if (previousDataSeriesCountRef.current === 0 && value.length === 1) {
      setDataSeriesEditIndex(0);
      setPopoverAnchorElement(document.getElementById('data-series-button-1'));
    }

    previousDataSeriesCountRef.current = value.length;
  }, [value.length]);

  const handleDataSeriesClick = React.useCallback(
    (index: number) => (event: React.MouseEvent<HTMLElement>) => {
      setDataSeriesEditIndex(index);
      setPopoverAnchorElement(event.currentTarget);
    },
    [],
  );

  const handleDuplicateDataSeries = React.useCallback(
    (index: number) => () => {
      const newDataSeriesCount = value.length + 1;

      onChange([
        ...value.slice(0, index + 1),
        {
          ...value[index],
          color: defaultPalette[(newDataSeriesCount - 1) % defaultPalette.length],
        },
        ...value.slice(index + 1),
      ]);
    },
    [defaultPalette, onChange, value],
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
    (
      draft: appDom.AppDom,
      index: number,
      newValue: unknown,
      propName: string,
      defaultValue: unknown = '',
    ): appDom.AppDom => {
      const draftNode = nodeId ? (appDom.getMaybeNode(draft, nodeId) as appDom.ElementNode) : null;

      if (draftNode) {
        const previousData = draftNode.props?.data || [];

        return appDom.setNodeNamespacedProp(
          draft,
          draftNode,
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
        );
      }

      return draft;
    },
    [nodeId],
  );

  const handleDataSeriesDataChange = React.useCallback(
    (index: number) => (newValue: BindableAttrValue<ChartDataSeries['data']> | null) => {
      const previousDataSeries = value[index];

      domApi.update((draft) => {
        draft = updateDataSeriesProp(draft, index, newValue, 'data', []);

        if (!previousDataSeries.xKey || !previousDataSeries.yKey) {
          const newDataResult = (evaluateBindable(jsBrowserRuntime, newValue, pageState).value ||
            []) as NonNullable<ChartDataSeries['data']>;

          let inferredXKey;

          const keySuggestions = newDataResult
            .flatMap((dataSeriesPoint) => Object.keys(dataSeriesPoint))
            .filter((key, pointIndex, array) => array.indexOf(key) === pointIndex);

          if (!previousDataSeries.xKey) {
            inferredXKey =
              keySuggestions.find((key) =>
                newDataResult.every((dataSeriesPoint) => typeof dataSeriesPoint[key] === 'string'),
              ) || keySuggestions[0];

            draft = updateDataSeriesProp(draft, index, inferredXKey, 'xKey');
          }

          if (!previousDataSeries.yKey) {
            const xKey = previousDataSeries.xKey || inferredXKey;
            const inferredYKey =
              xKey && xKey === keySuggestions[0] ? keySuggestions[1] : keySuggestions[0];

            draft = updateDataSeriesProp(draft, index, inferredYKey, 'yKey');
          }
        }

        return draft;
      });
    },
    [domApi, jsBrowserRuntime, pageState, updateDataSeriesProp, value],
  );

  const handleDataSeriesTextInputPropChange = React.useCallback(
    (index: number, propName: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = event.target.value;
      domApi.update((draft) => updateDataSeriesProp(draft, index, newValue, propName));
    },
    [domApi, updateDataSeriesProp],
  );

  const handleDataSeriesAutocompletePropChange = React.useCallback(
    (index: number, propName: string) => (event: React.SyntheticEvent, newValue: string) => {
      domApi.update((draft) => updateDataSeriesProp(draft, index, newValue, propName));
    },
    [domApi, updateDataSeriesProp],
  );

  const handleDataSeriesColorChange = React.useCallback(
    (index: number) => (newValue: string | undefined) => {
      domApi.update((draft) => updateDataSeriesProp(draft, index, newValue, 'color'));
    },
    [domApi, updateDataSeriesProp],
  );

  const dataSeriesKeySuggestions = React.useMemo(
    () =>
      value.map((dataSeries) => {
        const dataResult = (evaluateBindable(jsBrowserRuntime, dataSeries.data, pageState).value ||
          []) as NonNullable<ChartDataSeries['data']>;

        return Array.isArray(dataResult)
          ? dataResult
              .flatMap((dataSeriesPoint) => Object.keys(dataSeriesPoint))
              .filter((key, index, array) => array.indexOf(key) === index)
          : [];
      }),
    [jsBrowserRuntime, pageState, value],
  );

  const editDataSeries = dataSeriesEditIndex !== null ? value[dataSeriesEditIndex] : null;

  return (
    <React.Fragment>
      <PropertyControl propType={propType}>
        <div>
          <List sx={{ mb: 1 }}>
            {value.map((dataSeries, index) => {
              const { label } = dataSeries;

              return (
                <ListItem key={index} disableGutters>
                  <ListItemButton
                    id={`data-series-button-${index + 1}`}
                    onClick={handleDataSeriesClick(index)}
                    aria-describedby={popoverId}
                  >
                    <ListItemText
                      primary={label}
                      primaryTypographyProps={{
                        style: { overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 166 },
                      }}
                    />
                  </ListItemButton>
                  <IconButton
                    aria-label="Duplicate data series"
                    onClick={handleDuplicateDataSeries(index)}
                  >
                    <ContentCopyIcon />
                  </IconButton>
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
        </div>
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
                value={editDataSeries?.xKey || ''}
                onInputChange={handleDataSeriesAutocompletePropChange(dataSeriesEditIndex, 'xKey')}
                renderInput={(params) => {
                  const keyExists =
                    !editDataSeries?.xKey ||
                    dataSeriesKeySuggestions[dataSeriesEditIndex].includes(editDataSeries.xKey);

                  return (
                    <TextField
                      {...params}
                      label="xKey"
                      error={!keyExists}
                      helperText={keyExists ? '' : 'Property not present in data'}
                    />
                  );
                }}
              />
              <Autocomplete
                freeSolo
                options={dataSeriesKeySuggestions[dataSeriesEditIndex]}
                value={editDataSeries?.yKey || ''}
                onInputChange={handleDataSeriesAutocompletePropChange(dataSeriesEditIndex, 'yKey')}
                renderInput={(params) => {
                  const keyExists =
                    !editDataSeries?.yKey ||
                    dataSeriesKeySuggestions[dataSeriesEditIndex].includes(editDataSeries.yKey);

                  return (
                    <TextField
                      {...params}
                      label="yKey"
                      error={!keyExists}
                      helperText={keyExists ? '' : 'Property not present in data'}
                    />
                  );
                }}
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
