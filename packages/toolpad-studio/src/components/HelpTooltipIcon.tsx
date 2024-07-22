import * as React from 'react';
import { SvgIconProps, Tooltip } from '@mui/material';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';

export interface HelpTooltipIconProps extends SvgIconProps {
  helpText: React.ReactNode;
}

export default function HelpTooltipIcon({ helpText, ...props }: HelpTooltipIconProps) {
  return (
    <Tooltip title={helpText}>
      <HelpOutlineIcon {...props} color="secondary" />
    </Tooltip>
  );
}
