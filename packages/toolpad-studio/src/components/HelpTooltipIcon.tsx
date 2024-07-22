import * as React from 'react';
import { styled, SvgIconProps, Tooltip } from '@mui/material';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';

export interface HelpTooltipIconProps extends SvgIconProps {
  helpText: React.ReactNode;
}

const HelpIcon = styled(HelpOutlineIcon)(({ theme }) => ({
  color: theme.palette.text.secondary,
}));

export default function HelpTooltipIcon({ helpText, ...props }: HelpTooltipIconProps) {
  return (
    <Tooltip title={helpText}>
      <HelpIcon {...props} />
    </Tooltip>
  );
}
