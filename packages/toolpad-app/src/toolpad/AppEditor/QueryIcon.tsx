import * as React from 'react';

import HttpIcon from '@mui/icons-material/Http';
import JavascriptIcon from '@mui/icons-material/Javascript';
import AdsClickIcon from '@mui/icons-material/AdsClick';
import AutoModeIcon from '@mui/icons-material/AutoMode';
import { SvgIconProps } from '@mui/material/SvgIcon';
import { SxProps } from '@mui/system';

const iconMap = new Map<string, React.ComponentType<SvgIconProps>>([
  ['automatic', AutoModeIcon],
  ['manual', AdsClickIcon],
  ['rest', HttpIcon],
  ['local', JavascriptIcon],
]);

interface QueryIconProps {
  id: string;
  sx?: SxProps;
}

export default function QueryIcon({ id: iconId, sx }: QueryIconProps) {
  const Icon = iconMap.get(iconId);
  // The HTTP icon is abnormally wide, so we need to add some extra margin to it.
  return Icon ? <Icon sx={{ mr: iconId === 'rest' ? 0.5 : 0, ...sx }} /> : null;
}
