import * as React from 'react';
import { Tooltip, TooltipProps } from '@mui/material';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';

export interface HelpTooltipIconProps extends Omit<TooltipProps, 'title' | 'children'> {
  helpText: React.ReactNode;
  iconSx?: React.CSSProperties;
}

export default function HelpTooltipIcon({ helpText, iconSx, ...props }: HelpTooltipIconProps) {
  return (
    <Tooltip {...props} title={helpText}>
      <HelpOutlineIcon sx={{ ...iconSx, color: 'text.secondary' }} />
    </Tooltip>
  );
}
