import * as React from 'react';
import {
  Box,
  Button,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import type { ChartDataSeries } from '@mui/toolpad-components';
import { useBrowserJsRuntime } from '@mui/toolpad-core/jsBrowserRuntime';
import { BindableAttrValue } from '@mui/toolpad-core';
import DeleteIcon from '@mui/icons-material/Delete';
import type { EditorProps } from '../../types';
import PropertyControl from '../../components/PropertyControl';
import { usePageEditorState } from '../AppEditor/PageEditor/PageEditorProvider';

// eslint-disable-next-line import/no-cycle
import { BindingEditor } from '../AppEditor/BindingEditor';

function ChartDataPropEditor({
  propType,
  value = [],
  onChange,
}: EditorProps<
  (Omit<ChartDataSeries, 'data'> & { data: BindableAttrValue<ChartDataSeries['data']> })[]
>) {
  const { bindings, pageState, globalScopeMeta } = usePageEditorState();
  const jsBrowserRuntime = useBrowserJsRuntime();

  const handleDataSeriesChange = React.useCallback(
    (index: number) => (newValue: BindableAttrValue<ChartDataSeries['data']> | null) => {
      if (newValue) {
        onChange([
          ...value.slice(0, index),
          { ...value[index], data: newValue },
          ...value.slice(index + 1),
        ]);
      }
    },
    [onChange, value],
  );

  const handleAddDataSeries = React.useCallback(() => {
    onChange([
      ...value,
      {
        kind: 'line',
        label: 'newSeries',
        data: { type: 'const', value: {} },
        xKey: 'x',
        yKey: 'y',
      },
    ]);
  }, [onChange, value]);

  const handleRemoveDataSeries = React.useCallback(
    (index: number) => () => {
      onChange([...value.slice(0, index), ...value.slice(index + 1)]);
    },
    [onChange, value],
  );

  return (
    <PropertyControl propType={propType}>
      <Box>
        <List sx={{ mb: 1 }}>
          {value.map((dataSeries, index) => {
            const { label } = dataSeries;

            const bindingId = `${'1234'}.props.data[${index}]`;

            const liveBinding = bindings[bindingId];

            return (
              <ListItem key={`${label}-${index}`} disableGutters onClick={() => {}}>
                <ListItemButton>
                  <ListItemText primary={label} />
                  <BindingEditor<ChartDataSeries['data']>
                    globalScope={pageState}
                    globalScopeMeta={globalScopeMeta}
                    label={label}
                    jsRuntime={jsBrowserRuntime}
                    propType={propType}
                    value={value[index].data}
                    onChange={handleDataSeriesChange(index)}
                    liveBinding={liveBinding}
                  />
                  <IconButton
                    aria-label="Delete data series"
                    onClick={handleRemoveDataSeries(index)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
        <Button variant="outlined" startIcon={<AddIcon />} fullWidth onClick={handleAddDataSeries}>
          Create new data series
        </Button>
      </Box>
    </PropertyControl>
  );
}

export default ChartDataPropEditor;
