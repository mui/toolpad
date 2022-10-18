import { Typography } from '@mui/material';
import { Box, SxProps } from '@mui/system';
import * as React from 'react';
import JsonView from '../../components/JsonView';

export interface GlobalScopeExplorerProps {
  value?: Record<string, unknown>;
  sx?: SxProps;
}

export default function GlobalScopeExplorer({ value, sx }: GlobalScopeExplorerProps) {
  return (
    <Box sx={{ ...sx, width: 200, display: 'flex', flexDirection: 'column' }}>
      <Typography sx={{ mb: 1 }} variant="subtitle2">
        Scope
      </Typography>
      <Box sx={{ overflow: 'auto' }}>
        {Object.entries(value ?? {}).map(([key, content]) => {
          return (
            <Box>
              <JsonView name={key} expandLevel={0} src={content} />
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}
