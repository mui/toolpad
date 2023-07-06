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
  const isPopoverOpen = Boolean(popoverAnchorElement);

  const handlePopoverClose = React.useCallback(() => {
    setPopoverAnchorElement(null);
  }, []);

  const handleDataSeriesDataChange = React.useCallback(
    (index: number) => (newValue: BindableAttrValue<ChartDataSeries['data']> | null) => {
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
                data: newValue || [],
              },
              index,
            ),
          ),
        );
      }
    },
    [domApi, node],
  );

  const handleDataSeriesTextPropChange = React.useCallback(
    (index: number, propName: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = event.target.value;

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
                [propName]: newValue || '',
              },
              index,
            ),
          ),
        );
      }
    },
    [domApi, node],
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
                select
                label="kind"
                value={editDataSeries?.kind}
                onChange={handleDataSeriesTextPropChange(dataSeriesEditIndex, 'kind')}
              >
                {CHART_DATA_SERIES_KINDS.map((kind) => (
                  <MenuItem key={kind} value={kind}>
                    {kind}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                label="label"
                value={editDataSeries?.label}
                onChange={handleDataSeriesTextPropChange(dataSeriesEditIndex, 'label')}
              />
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
                onChange={handleDataSeriesTextPropChange(dataSeriesEditIndex, 'xKey')}
              />
              <TextField
                label="yKey"
                value={editDataSeries?.yKey}
                onChange={handleDataSeriesTextPropChange(dataSeriesEditIndex, 'yKey')}
              />
            </Stack>
          </Box>
        ) : null}
      </Popover>
    </React.Fragment>
  );
}

export default ChartDataPropEditor;
