import { Typography, Divider, Box, SxProps } from '@mui/material';
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
    <Box sx={{ ...sx, display: 'flex', flexDirection: 'column' }}>
      <Typography sx={{ mb: 1 }} variant="subtitle2">
        Scope
      </Typography>
      <Box sx={{ overflow: 'auto', whiteSpace: 'nowrap', border: 1, borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', width: 'fit-content' }}>
          {Object.entries(value).map(([key, content]) => {
            return (
              <React.Fragment key={key}>
                <Box sx={{ p: 1 }}>
                  <Typography>{key}</Typography>
                  <ObjectInspector expandLevel={0} data={content} />
                </Box>
                <Divider />
              </React.Fragment>
            );
          })}
          {extraGlobalKeys.map((key) => (
            <Box key={key}>{key}</Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
}
