import { Typography, Divider, Box, SxProps } from '@mui/material';
import { GlobalScopeMeta, GlobalScopeMetaField } from '@mui/toolpad-core';
import * as React from 'react';
import ObjectInspector from '../../components/ObjectInspector';

export interface GlobalScopeExplorerProps {
  value: Record<string, unknown>;
  meta: GlobalScopeMeta;
  sx?: SxProps;
}

type ExplorerItem = GlobalScopeMetaField & {
  key: string;
  value: unknown;
};

type ExplorerGroup = {
  displayName: string;
  items: ExplorerItem[];
};

type GroupKind = NonNullable<GlobalScopeMetaField['kind']> | 'other';

type ExplorerStructure = {
  [K in GroupKind]: ExplorerGroup;
};

function groupScopeMeta(value: Record<string, unknown>, meta: GlobalScopeMeta): ExplorerStructure {
  const structure: ExplorerStructure = {
    local: {
      displayName: 'Locals',
      items: [],
    },
    element: {
      displayName: 'Elements',
      items: [],
    },
    query: {
      displayName: 'Queries',
      items: [],
    },
    hidden: {
      displayName: 'Hidden',
      items: [],
    },
    other: {
      displayName: 'Other',
      items: [],
    },
  };

  const scopeKeys = new Set([...Object.keys(value), ...Object.keys(meta)]);

  for (const key of scopeKeys) {
    const metaField = meta[key];
    const group = metaField?.kind || 'other';

    if (group !== 'hidden') {
      structure[group].items.push({
        ...metaField,
        key,
        value: value[key],
      });
    }
  }

  return structure;
}

export default function GlobalScopeExplorer({ meta, value, sx }: GlobalScopeExplorerProps) {
  const structure = React.useMemo(() => groupScopeMeta(value, meta), [meta, value]);

  return (
    <Box sx={{ ...sx, display: 'flex', flexDirection: 'column' }}>
      <Typography sx={{ ml: 1, mb: 1 }} variant="subtitle2">
        Scope
      </Typography>
      <Box sx={{ overflow: 'auto', border: 1, borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'stretch' }}>
          {Object.entries(structure).map(([key, group]) => {
            if (group.items.length <= 0) {
              return null;
            }
            return (
              <React.Fragment key={key}>
                <Box>
                  <Typography sx={{ mx: 1, my: 0.5 }}>{group.displayName}</Typography>
                  <Divider />
                  <Box sx={{ m: 1 }}>
                    {group.items.map((item) => {
                      return (
                        <React.Fragment key={item.key}>
                          <ObjectInspector expandLevel={0} name={item.key} data={item.value} />
                        </React.Fragment>
                      );
                    })}
                  </Box>
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
