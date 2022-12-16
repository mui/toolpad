import { Typography, Divider, Box, SxProps } from '@mui/material';
import { GlobalScopeMeta } from '@mui/toolpad-core';
import * as React from 'react';
import ObjectInspector from '../../components/ObjectInspector';

export interface GlobalScopeExplorerProps {
  meta?: GlobalScopeMeta;
  sx?: SxProps;
}

export default function GlobalScopeExplorer({ meta = {}, sx }: GlobalScopeExplorerProps) {
  return (
    <Box sx={{ ...sx, display: 'flex', flexDirection: 'column' }}>
      <Typography sx={{ mb: 1 }} variant="subtitle2">
        Scope
      </Typography>
      <Box sx={{ overflow: 'auto', whiteSpace: 'nowrap', border: 1, borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', width: 'fit-content' }}>
          {Object.entries(meta).map(([key, scopeField]) => {
            if (!scopeField) {
              return null;
            }
            return (
              <React.Fragment key={key}>
                <Box sx={{ p: 1 }}>
                  <Typography>{key}</Typography>
                  <ObjectInspector expandLevel={0} data={scopeField.value} />
                </Box>
                <Divider />
              </React.Fragment>
            );
          })}
        </Box>
      </Box>
    </Box>
  );
}
