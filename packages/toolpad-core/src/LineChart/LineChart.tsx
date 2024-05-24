'use client';

import * as React from 'react';
import {
  LineChart as XLineChart,
  LineChartProps as XLineChartProps,
  AxisConfig,
  blueberryTwilightPalette,
} from '@mui/x-charts';
import { Box, useTheme } from '@mui/material';
import { Datum, ResolvedDataProvider, useGetMany } from '../DataProvider';
import { ErrorOverlay, LoadingOverlay } from '../shared';

export interface LineChartProps<R extends Datum> extends XLineChartProps {
  dataProvider: ResolvedDataProvider<R>;
}

export function LineChart<R extends Datum>(props: LineChartProps<R>) {
  const { dataProvider, xAxis, series, ...rest } = props;
  const theme = useTheme();
  const { data, loading, error } = useGetMany(dataProvider);
  const resolvedXAxis = React.useMemo(() => {
    return (
      xAxis?.map((axis) => {
        let defaults: Partial<AxisConfig> = {};
        if (axis.dataKey) {
          const field = dataProvider.fields?.[axis.dataKey];
          if (field) {
            defaults = {
              label: field.label,
            };
            if (field.type === 'date') {
              defaults.scaleType = 'time';
            }
          }
        }
        return { ...defaults, ...axis };
      }) ?? []
    );
  }, [dataProvider.fields, xAxis]);

  const resolvedSeries = React.useMemo(() => {
    const colorSchemeIndices = new Map(
      Object.keys(dataProvider.fields ?? {}).map((name, i) => [name, i]),
    );
    const colors = blueberryTwilightPalette(theme.palette.mode);
    return series.map((s) => {
      let defaults: Partial<XLineChartProps['series'][number]> = {};
      if (s.dataKey) {
        const name = s.dataKey;
        const field = dataProvider.fields?.[name];
        if (field) {
          const colorSchemeIndex = colorSchemeIndices.get(name) ?? 0;
          defaults = {
            label: field.label,
            color: colors[colorSchemeIndex % colors.length],
          };
          const valueFormatter = field.valueFormatter;
          if (valueFormatter) {
            defaults.valueFormatter = (value: any) => valueFormatter(value, name);
          }
        }
      }
      return { ...defaults, ...s };
    });
  }, [dataProvider.fields, theme.palette.mode, series]);

  const dataSet = React.useMemo(() => {
    const resolvedRows = data?.rows ?? [];
    return resolvedRows.map((row) => {
      const result: NonNullable<XLineChartProps['dataset']>[number] = {};
      for (const [name, field] of Object.entries(dataProvider.fields ?? {})) {
        let value = row[name];
        if (field.type === 'date' && (typeof value === 'string' || typeof value === 'number')) {
          value = new Date(value);
        }

        if (typeof value === 'string' || typeof value === 'number' || value instanceof Date) {
          result[name] = value;
        }
      }
      return result;
    });
  }, [data?.rows, dataProvider.fields]);

  return (
    <Box sx={{ position: 'relative' }}>
      <XLineChart dataset={dataSet} xAxis={resolvedXAxis} series={resolvedSeries} {...rest} />
      {loading ? <LoadingOverlay /> : null}
      {error ? <ErrorOverlay error={error} /> : null}
    </Box>
  );
}
