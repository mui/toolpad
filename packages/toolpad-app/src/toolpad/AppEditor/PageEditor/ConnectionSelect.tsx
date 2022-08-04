import { TextField, MenuItem, SxProps } from '@mui/material';
import * as React from 'react';
import { NodeId } from '@mui/toolpad-core';
import * as appDom from '../../../appDom';
import { WithControlledProp } from '../../../utils/types';
import { useDom } from '../../DomLoader';
import { asArray } from '../../../utils/collections';

export interface ConnectionSelectProps extends WithControlledProp<NodeId | null> {
  dataSource?: string | string[];
  sx?: SxProps;
}

export default function ConnectionSelect({
  sx,
  dataSource,
  value,
  onChange,
}: ConnectionSelectProps) {
  const dom = useDom();

  const app = appDom.getApp(dom);
  const { connections = [] } = appDom.getChildNodes(dom, app);

  const filtered = React.useMemo(() => {
    const filteredSources = new Set(asArray(dataSource));
    return dataSource
      ? connections.filter((connection) =>
          filteredSources.has(connection.attributes.dataSource.value),
        )
      : connections;
  }, [connections, dataSource]);

  const handleSelectionChange = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      onChange((event.target.value as NodeId) || null);
    },
    [onChange],
  );

  return (
    <TextField
      sx={sx}
      select
      fullWidth
      value={value || ''}
      label="Connection"
      onChange={handleSelectionChange}
    >
      {filtered.map((connection) => (
        <MenuItem key={connection.id} value={connection.id}>
          {connection.name} | {connection.attributes.dataSource.value}
        </MenuItem>
      ))}
    </TextField>
  );
}
