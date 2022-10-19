import { Typography } from '@mui/material';
import { Box, SxProps } from '@mui/system';
import * as React from 'react';
import ObjectInspector from '../../components/ObjectInspector';
import { GlobalScopeMeta } from '../../utils/types';

export interface GlobalScopeExplorerProps {
  value?: Record<string, unknown>;
  meta?: GlobalScopeMeta;
  sx?: SxProps;
}

export default function GlobalScopeExplorer({
  meta = {},
  value = {},
  sx,
}: GlobalScopeExplorerProps) {
  const valueKeys = new Set(Object.keys(value));
  const extraGlobalKeys = Object.keys(meta).filter((key) => !valueKeys.has(key));
  return (
    <Box sx={{ ...sx, width: 200, display: 'flex', flexDirection: 'column' }}>
      <Typography sx={{ mb: 1 }} variant="subtitle2">
        Scope
      </Typography>
      <Box sx={{ overflow: 'auto', whiteSpace: 'nowrap' }}>
        {Object.entries(value).map(([key, content]) => {
          return (
            <Box key={key} sx={{ display: 'flex', flexDirection: 'row', gap: 1 }}>
              {key}
              <ObjectInspector expandLevel={0} data={content} />
            </Box>
          );
        })}
        {extraGlobalKeys.map((key) => (
          <Box key={key}>{key}</Box>
        ))}
      </Box>
    </Box>
  );
}
