import * as React from 'react';
import { Box, Stack, Tab, styled, Container } from '@mui/material';
import { TabContext, TabList, TabPanel as MuiTabPanel } from '@mui/lab';
import useStorageState from '@mui/toolpad-utils/hooks/useStorageState';
import { DataGridFile, DataGridSpec } from '../../shared/schemas';
import ColumnsEditor from './ColumnsEditor';
import RowsEditor from './RowsEditor';

const TabPanel = styled(MuiTabPanel)({ padding: 0, flex: 1, minHeight: 0 });

interface DataGridFileEditorProps {
  value: DataGridFile;
  onChange: (value: DataGridFile) => void;
  source?: string;
  commitButton: React.ReactNode;
}

export default function DataGridFileEditor({
  value,
  onChange,
  source,
  commitButton,
}: DataGridFileEditorProps) {
  const [activeTab, setActiveTab] = useStorageState('session', `activeTab`, 'data');

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
          <Stack direction="row">Width / Height</Stack>
        </TabPanel>
        <TabPanel value="rows">
          <RowsEditor value={value.spec || {}} onChange={handleSpecChange} />
        </TabPanel>
        <TabPanel value="columns">
          <ColumnsEditor value={value.spec ?? {}} onChange={handleSpecChange} />
        </TabPanel>
        <TabPanel value="source">
          <Container sx={{ width: '100%', height: '100%', overflow: 'auto', px: 4 }}>
            <pre>{source}</pre>
          </Container>
        </TabPanel>
      </TabContext>
    </Box>
  );
}
