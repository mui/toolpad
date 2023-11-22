import * as React from 'react';

import HttpIcon from '@mui/icons-material/Http';
import JavascriptIcon from '@mui/icons-material/Javascript';
import AdsClickIcon from '@mui/icons-material/AdsClick';
import AutoModeIcon from '@mui/icons-material/AutoMode';
import { SvgIconProps } from '@mui/material/SvgIcon';
import { SxProps } from '@mui/system';

const dataSourceIconMap = new Map<string, React.ComponentType<SvgIconProps>>([
  ['rest', HttpIcon],
  ['local', JavascriptIcon],
]);

const modeIconMap = new Map<string, React.ComponentType<SvgIconProps>>([
  ['query', AutoModeIcon],
  ['action', AdsClickIcon],
  ['mutation', AdsClickIcon],
]);

interface QueryIconProps {
  id?: string;
  mode?: string;
  sx?: SxProps;
}

export default function QueryIcon({ id: iconId, mode, sx }: QueryIconProps) {
  const DataSourceIcon = dataSourceIconMap.get(iconId ?? '');
  const ModeIcon = modeIconMap.get(mode ?? '');

  return (
    <div style={{ display: 'flex' }}>
      {ModeIcon ? (
        <ModeIcon
          sx={{
            fontSize: 12,
            mt: (theme) => (DataSourceIcon ? theme.spacing(0.5) : 0),
          }}
        />
      ) : null}
      {DataSourceIcon ? (
        // The HTTP icon is abnormally wide, so we need to add some extra margin to it.}
        <DataSourceIcon
          sx={{
            mr: (theme) => (iconId === 'rest' ? theme.spacing(0.75) : theme.spacing(0.25)),
            ml: (theme) => (ModeIcon && iconId === 'rest' ? theme.spacing(0.5) : 0),
            ...sx,
          }}
        />
      ) : null}
    </div>
  );
}
