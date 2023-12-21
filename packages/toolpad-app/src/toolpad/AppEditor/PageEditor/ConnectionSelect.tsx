import { TextField, MenuItem, SxProps } from '@mui/material';
import * as React from 'react';
import { NodeId } from '@mui/toolpad-core';
import { asArray } from '@mui/toolpad-utils/collections';
import * as appDom from '../../../appDom';
import { Maybe, WithControlledProp } from '../../../utils/types';
import { useAppState } from '../../AppState';
import dataSources from '../../../toolpadDataSources/client';

export type ConnectionOption = {
  connectionId: NodeId | null;
  dataSourceId: string;
};

export interface ConnectionSelectProps extends WithControlledProp<ConnectionOption | null> {
  dataSource?: Maybe<string | string[]>;
  sx?: SxProps;
}

export default function ConnectionSelect({
  sx,
  dataSource,
  value,
  onChange,
}: ConnectionSelectProps) {
  const { dom } = useAppState();

  const app = appDom.getApp(dom);
  const { connections = [] } = appDom.getChildNodes(dom, app);

  const options: ConnectionOption[] = React.useMemo(() => {
    const filteredSources = new Set(asArray(dataSource));
    const result: ConnectionOption[] = [];

    for (const [dataSourceId, config] of Object.entries(dataSources)) {
      if (config?.hasDefault) {
        if (!dataSource || filteredSources.has(dataSourceId)) {
          result.push({
            dataSourceId,
            connectionId: null,
          });
        }
      }
    }

    for (const connection of connections) {
      const connectionDataSourceId = connection.attributes.dataSource;
      if (!dataSource || filteredSources.has(connectionDataSourceId)) {
        const connectionDataSource = dataSources[connectionDataSourceId];
        if (connectionDataSource) {
          result.push({
            connectionId: connection.id,
            dataSourceId: connectionDataSourceId,
          });
        }
      }
    }

    return result;
  }, [connections, dataSource]);

  const handleSelectionChange = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const index = Number(event.target.value);
      onChange(options[index] || null);
    },
    [onChange, options],
  );

  const selection = React.useMemo(() => {
    if (!value) {
      return '';
    }
    return String(
      options.findIndex(
        (option) =>
          option.connectionId === value.connectionId && option.dataSourceId === value.dataSourceId,
      ),
    );
  }, [options, value]);

  return (
    <TextField sx={sx} select value={selection} label="Connection" onChange={handleSelectionChange}>
      {options.map((option, index) => {
        const config = dataSources[option.dataSourceId];
        const dataSourceLabel = config
          ? config.displayName
          : `<unknown datasource "${option.dataSourceId}">`;

        return (
          <MenuItem key={index} value={index}>
            {dataSourceLabel}
          </MenuItem>
        );
      })}
    </TextField>
  );
}
