import * as React from 'react';
import { TabPanel as MuiTabPanel, TabPanelProps as MuiTabPanelProps } from '@mui/lab';

export interface TabPanelProps extends MuiTabPanelProps {
  // TODO: Propose feature request in core: disableGutters for TabPanel
  disableGutters?: boolean;
}

const TabPanel = React.forwardRef<typeof MuiTabPanel, TabPanelProps>(
  ({ disableGutters, sx, ...props }, ref) => (
    <MuiTabPanel ref={ref} sx={disableGutters ? { padding: 0, ...sx } : sx} {...props} />
  ),
);

export default TabPanel;
