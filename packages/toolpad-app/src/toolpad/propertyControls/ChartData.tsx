import * as React from 'react';
import {
  Box,
  Button,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Popover,
  Stack,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import type { ChartDataSeries } from '@mui/toolpad-components';
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

// @TODO: This is a copy from the function in `src/server/localMode` - should it be a shared utility?
function toBindable<V>(
  value: V | { $$jsExpression: string } | { $$env: string },
): BindableAttrValue<V> {
  if (value && typeof value === 'object' && typeof (value as any).$$jsExpression === 'string') {
    return { type: 'jsExpression', value: (value as any).$$jsExpression };
  }
  if (value && typeof value === 'object' && typeof (value as any).$$env === 'string') {
    return { type: 'env', value: (value as any).$$env };
  }
  return { type: 'const', value: value as V };
}

// @TODO: This is a copy from the function in `src/server/localMode` - should it be a shared utility?
function fromBindable<V>(bindable: BindableAttrValue<V>) {
  switch (bindable.type) {
    case 'const':
      return bindable.value;
    case 'jsExpression':
      return { $$jsExpression: bindable.value };
    case 'env':
      return { $$env: bindable.value };
    default:
      throw new Error(`Unsupported bindable "${bindable.type}"`);
  }
}

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
    onChange([
      ...value,
      {
        kind: 'line',
        label: `dataSeries${value.length + 1}`,
        data: [],
        xKey: 'x',
        yKey: 'y',
      },
    ]);
  }, [onChange, value]);

  const handleDataSeriesClick = React.useCallback(
    (index: number) => (event: React.MouseEvent<HTMLElement>) => {
      setDataSeriesEditIndex(index);
      setPopoverAnchorElement(event.currentTarget);
    },
    [],
  );

  const handleRemoveDataSeries = React.useCallback(
    (index: number) => () => {
      onChange([...value.slice(0, index), ...value.slice(index + 1)]);
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
        const previousData = node.props?.data?.value || [];

        domApi.update((draft) =>
          appDom.setNodeNamespacedProp(draft, node, 'props', 'data', {
            type: 'const',
            value: [
              ...previousData.slice(0, index),
              { ...previousData[index], data: newValue ? fromBindable(newValue) : [] },
              ...previousData.slice(index + 1),
            ],
          }),
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
                <ListItem key={`${label}-${index}`} disableGutters>
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
              <BindableEditor
                liveBinding={bindings[`${nodeId}.props.data[${dataSeriesEditIndex}].data`]}
                globalScope={pageState}
                globalScopeMeta={globalScopeMeta}
                label="data"
                jsRuntime={jsBrowserRuntime}
                propType={{ type: 'array' }}
                value={
                  (node.props?.data?.value &&
                    toBindable(node.props.data.value[dataSeriesEditIndex].data)) ??
                  null
                }
                onChange={handleDataSeriesDataChange(dataSeriesEditIndex)}
              />
            </Stack>
          </Box>
        ) : null}
      </Popover>
    </React.Fragment>
  );
}

export default ChartDataPropEditor;
