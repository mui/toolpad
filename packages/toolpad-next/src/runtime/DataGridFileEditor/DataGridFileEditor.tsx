import * as React from 'react';
import {
  Box,
  Tab,
  styled,
  Container,
  TextFieldProps,
  TextField,
  FormControl,
  FormControlLabel,
  FormLabel,
  Radio,
  RadioGroup,
  Typography,
} from '@mui/material';
import { TabContext, TabList, TabPanel as MuiTabPanel } from '@mui/lab';
import useStorageState from '@mui/toolpad-utils/hooks/useStorageState';
import { DataGridFile, DataGridSpec } from '../../shared/schemas';
import ColumnsEditor from './ColumnsEditor';
import RowsEditor from './RowsEditor';
import { CodeGenerationResult } from '../../shared/codeGeneration';

function NumberField({ value, onChange, onBlur, ...props }: TextFieldProps) {
  const [input, setInput] = React.useState(value);
  React.useEffect(() => {
    setInput(value);
  }, [value]);
  const clearEventRef = React.useRef<React.ChangeEvent<HTMLInputElement> | null>(null);
  const handleChange = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = event.target.value;
      setInput(newValue);
      if (newValue) {
        // Only fire onChange when there is a value
        onChange?.(event);
        clearEventRef.current = null;
      } else {
        clearEventRef.current = event;
      }
    },
    [onChange],
  );
  const handleBlur = React.useCallback(
    (event: React.FocusEvent<HTMLInputElement>) => {
      if (clearEventRef.current) {
        onChange?.(clearEventRef.current);
      }
      onBlur?.(event);
    },
    [onBlur, onChange],
  );
  return (
    <TextField type="number" value={input} onChange={handleChange} onBlur={handleBlur} {...props} />
  );
}

const TabPanel = styled(MuiTabPanel)({ padding: 0, flex: 1, minHeight: 0 });

interface DataGridFileEditorProps {
  value: DataGridFile;
  onChange: (value: DataGridFile) => void;
  source?: CodeGenerationResult;
  commitButton: React.ReactNode;
}

export default function DataGridFileEditor({
  value,
  onChange,
  source,
  commitButton,
}: DataGridFileEditorProps) {
  const [activeTab, setActiveTab] = useStorageState('session', 'activeTab', 'general');

  const handleSpecChange = React.useCallback(
    (newSpec: DataGridSpec) => {
      if (value.spec !== newSpec) {
        onChange({
          ...value,
          spec: newSpec,
        });
      }
    },
    [onChange, value],
  );

  const heightMode = value.spec?.heightMode || 'fixed';

  return (
    <Box sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <TabContext value={activeTab}>
        <Box
          sx={{
            borderBottom: 1,
            borderColor: 'divider',
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'end',
          }}
        >
          <TabList onChange={(_event, newValue) => setActiveTab(newValue)}>
            <Tab label="General" value="general" />
            <Tab label="Rows" value="rows" />
            <Tab label="Columns" value="columns" />
            <Tab label="Source" value="source" />
          </TabList>
          {commitButton}
        </Box>

        <TabPanel value="general">
          <Container>
            <div>
              <FormControl>
                <FormLabel>Data Grid Height</FormLabel>
                <RadioGroup
                  value={heightMode}
                  onChange={(event, newHeightMode) =>
                    handleSpecChange({
                      ...value.spec,
                      heightMode: newHeightMode as DataGridSpec['heightMode'],
                    })
                  }
                >
                  <FormControlLabel value="auto" control={<Radio />} label="Auto height" />
                  <FormControlLabel
                    value="container"
                    control={<Radio />}
                    label="Adapt height to container"
                  />
                  <FormControlLabel value="fixed" control={<Radio />} label="Fixed height" />
                </RadioGroup>
              </FormControl>
            </div>
            <div>
              <NumberField
                label="height"
                value={value.spec?.height ?? 400}
                disabled={heightMode !== 'fixed'}
                onChange={(event) => {
                  handleSpecChange({
                    ...value.spec,
                    height: event.target.value ? Number(event.target.value) : undefined,
                  });
                }}
              />
            </div>
          </Container>
        </TabPanel>
        <TabPanel value="rows">
          <RowsEditor value={value.spec || {}} onChange={handleSpecChange} />
        </TabPanel>
        <TabPanel value="columns">
          <ColumnsEditor value={value.spec ?? {}} onChange={handleSpecChange} />
        </TabPanel>
        <TabPanel value="source">
          <Container sx={{ width: '100%', height: '100%', overflow: 'auto', px: 4 }}>
            {source
              ? source.files.map(([path, { code }]) => (
                  <Box key={path}>
                    <Typography variant="h6">{path}</Typography>
                    <pre>{code}</pre>
                  </Box>
                ))
              : null}
          </Container>
        </TabPanel>
      </TabContext>
    </Box>
  );
}
