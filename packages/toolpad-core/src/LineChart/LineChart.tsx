'use client';

import * as React from 'react';
import {
  LineChart as XLineChart,
  LineChartProps as XLineChartProps,
  AxisConfig,
  blueberryTwilightPalette,
  LineSeriesType,
} from '@mui/x-charts';
import { Box, useTheme } from '@mui/material';
import { Datum, ResolvedDataProvider, useGetMany } from '../DataProvider';
import { ErrorOverlay, LoadingOverlay } from '../shared';

export type LineChartSeries = XLineChartProps['series'];

export interface LineChartProps<R extends Datum> extends Partial<XLineChartProps> {
  dataProvider: ResolvedDataProvider<R>;
}

export function LineChart<R extends Datum>(props: LineChartProps<R>) {
  const { dataProvider, xAxis, series, ...rest } = props;
  const theme = useTheme();
  const { data, loading, error } = useGetMany(dataProvider);
  const resolvedXAxis = React.useMemo(() => {
    if (!xAxis || xAxis.length <= 0) {
      return [{ dataKey: 'id' }];
    }
    return xAxis.map((axis) => {
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
    });
  }, [dataProvider.fields, xAxis]);

  const resolvedSeries = React.useMemo(() => {
    const resolvedSeriesProp: LineChartSeries =
      series ||
      Object.keys(dataProvider.fields ?? {})
        .filter((dataKey) => dataKey !== 'id' && dataProvider.fields?.[dataKey]?.type === 'number')
        .map((dataKey) => ({ dataKey }));

    const colorSchemeIndices = new Map(
      Object.keys(dataProvider.fields ?? {}).map((name, i) => [name, i]),
    );

    const colors = blueberryTwilightPalette(theme.palette.mode);

    return resolvedSeriesProp.map((s) => {
      let defaults: Partial<LineSeriesType> = {};
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
/*
Since we're sharing books, my wife (who also works in a people department) is reading Erin Meyer's "The Culture Map" and she's been telling me about it. I didn't read it myself but what she told me about high vs. low context cultures was very insightful in understanding 