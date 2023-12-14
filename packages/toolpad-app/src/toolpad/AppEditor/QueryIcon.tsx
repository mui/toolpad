import * as React from 'react';
import HttpIcon from '@mui/icons-material/Http';
import JavascriptIcon from '@mui/icons-material/Javascript';
import AdsClickIcon from '@mui/icons-material/AdsClick';
import AutoModeIcon from '@mui/icons-material/AutoMode';
import { SvgIconProps } from '@mui/material/SvgIcon';
import { SxProps } from '@mui/system';
import { styled } from '@mui/material/styles';

const dataSourceIconMap = new Map<string, React.FC<SvgIconProps>>([
  [
    'rest',
    styled(HttpIcon)(({ theme }) => ({
      marginRight: theme.spacing(0.5),
      marginLeft: theme.spacing(0.5),
    })),
  ],
  [
    'local',
    styled(JavascriptIcon)(({ theme }) => ({
      marginRight: theme.spacing(0.25),
      marginLeft: theme.spacing(0),
    })),
  ],
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
    <div style={{ display: 'flex', gap: 0.5 }}>
      {ModeIcon ? (
        <ModeIcon
          sx={{
            fontSize: 12,
            alignSelf: 'center',
          }}
        />
      ) : null}
      {DataSourceIcon ? <DataSourceIcon sx={sx} /> : null}
    </div>
  );
}
