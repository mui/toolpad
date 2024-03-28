import * as React from 'react';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

export function CollapseIcon() {
  return <ExpandMoreIcon sx={{ fontSize: '0.9rem', opacity: 0.5 }} />;
}

export function ExpandIcon() {
  return <ChevronRightIcon sx={{ fontSize: '0.9rem', opacity: 0.5 }} />;
}
