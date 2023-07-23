import * as React from 'react';
import { Box, IconButton, Stack, Tab, Tooltip, styled, Container } from '@mui/material';
import { TabContext, TabList, TabPanel as MuiTabPanel } from '@mui/lab';
import SaveIcon from '@mui/icons-material/Save';
import useStorageState from '@mui/toolpad-utils/hooks/useStorageState';
import { DataGridFile, DataGridSpec } from '../../shared/schemas';
import { useServer } from '../server';
import ColumnsEditor from './ColumnsEditor';
import RowsEditor from './RowsEditor';

const TabPanel = styled(MuiTabPanel)({ padding: 0, flex: 1, minHeight: 0 });

interface DataGridFileEditorProps {
  name: string;
  value: DataGridFile;
  onChange: (value: DataGridFile) => void;
  onClose?: () => void;
  source?: string;
}

export default function DataGridFileEditor({
  name,
  value,
  onChange,
  onClose,
  source,
}: DataGridFileEditorProps) {
  const [activeTab, setActiveTab] = useStorageState('session', `activeTab`, 'data');

  const server = useServer();

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
          <Tooltip title="Commit changes">
            <IconButton
              sx={{ m: 0.5 }}
              onClick={() => {
                server.saveFile(name, value).then(() => onClose?.());
              }}
            >
              <SaveIcon />
            </IconButton>
          </Tooltip>
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
