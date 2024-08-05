import { TabPanel as MuiTabPanel } from '@mui/lab';
import { styled } from '@mui/material';

const TabPanel = styled(MuiTabPanel, {
  shouldForwardProp: (prop) => prop !== 'disableGutters',
})<{
  disableGutters?: boolean;
}>(({ disableGutters }) => ({
  ...(disableGutters && {
    padding: 0,
  }),
}));

export default TabPanel;
