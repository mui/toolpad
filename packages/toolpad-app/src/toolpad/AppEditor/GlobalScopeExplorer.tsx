import { Typography, Divider, Box, SxProps } from '@mui/material';
import { GlobalScopeMeta } from '@mui/toolpad-core';
import * as React from 'react';
import ObjectInspector from '../../components/ObjectInspector';
import { hasOwnProperty } from '../../utils/collections';

export interface GlobalScopeExplorerProps {
  value: Record<string, unknown>;
  meta: GlobalScopeMeta;
  sx?: SxProps;
}

export default function GlobalScopeExplorer({ meta, value, sx }: GlobalScopeExplorerProps) {
  const scopeKeys = new Set([...Object.keys(value), ...Object.keys(meta)]);
  return (
    <Box sx={{ ...sx, display: 'flex', flexDirection: 'column' }}>
      <Typography sx={{ mb: 1 }} variant="subtitle2">
        Scope
      </Typography>
      <Box sx={{ overflow: 'auto', whiteSpace: 'nowrap', border: 1, borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', width: 'fit-content' }}>
          {Array.from(scopeKeys, (key) => {
            if (hasOwnProperty(value, key)) {
              return (
                <React.Fragment key={key}>
                  <Box sx={{ p: 1 }}>
                    <Typography>{key}</Typography>
                    <ObjectInspector expandLevel={0} data={value[key]} />
                  </Box>
                  <Divider />
                </React.Fragment>
              );
            }

            return <Box key={key}>{key}</Box>;
          })}
        </Box>
      </Box>
    </Box>
  );
}
