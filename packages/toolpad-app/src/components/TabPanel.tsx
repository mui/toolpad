import styled from '@emotion/styled';
import { TabPanel, TabPanelProps as MuiTabPanelProps } from '@mui/lab';

export interface TabPanelProps extends MuiTabPanelProps {
  // TODO: Propose feature request in core: disableGutters for TabPanel
  disableGutters?: boolean;
}

export default styled(TabPanel)(({ disableGutters }: TabPanelProps) => ({
  ...(disableGutters ? { padding: 0 } : {}),
}));
