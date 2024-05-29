'use client';

import * as React from 'react';
import {
  LineChart as XLineChart,
  LineChartProps as XLineChartProps,
  AxisConfig,
  blueberryTwilightPalette,
  LineSeriesType,
} from '@mui/x-charts';
import { styled, useTheme } from '@mui/material';
import { Datum, ResolvedDataProvider, useGetMany } from '../DataProvider';
import { ErrorOverlay, LoadingOverlay } from '../shared';

const LineChartRoot = styled('div')({
  position: 'relative',
});

const CHART_CLASS = 'line-chart';

export type LineChartSeries = XLineChartProps['series'];

export interface LineChartProps<R extends Datum> extends Partial<XLineChartProps> {
  dataProvider?: ResolvedDataProvider<R>;
}

export/**
 *
 * Demos:
 *
 * - [Line Chart](https://mui.com/toolpad/core/react-line-chart/)
 *
 * API:
 *
 * - [LineChart API](https://mui.com/toolpad/core/api/line-chart)
 */ function LineChart<R extends Datum>(props: LineChartProps<R>) {
  const { dataProvider, xAxis, series, ...rest } = props;
  const theme = useTheme();
  const { data, loading, error } = useGetMany(dataProvider ?? null);
  const resolvedXAxis = React.useMemo(() => {
    if (!xAxis || xAxis.length <= 0) {
      return [{ dataKey: 'id' }];
    }
    return xAxis.map((axis) => {
      let defaults: Partial<AxisConfig> = {};
      if (axis.dataKey) {
        const field = dataProvider?.fields?.[axis.dataKey];
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
  }, [dataProvider?.fields, xAxis]);

  const resolvedSeries = React.useMemo(() => {
    const idField = dataProvider?.idField ?? 'id';
    const resolvedSeriesProp: LineChartSeries =
      series ||
      Object.keys(dataProvider?.fields ?? {})
        .filter(
          (dataKey) => dataKey !== idField && dataProvider?.fields?.[dataKey]?.type === 'number',
        )
        .map((dataKey) => ({ dataKey }));

    const colorSchemeIndices = new Map(
      Object.keys(dataProvider?.fields ?? {}).map((name, i) => [name, i]),
    );

    const colors = blueberryTwilightPalette(theme.palette.mode);

    return resolvedSeriesProp.map((s) => {
      let defaults: Partial<LineSeriesType> = {};
      if (s.dataKey) {
        const name = s.dataKey;
        const field = dataProvider?.fields?.[name];
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
  }, [dataProvider?.idField, dataProvider?.fields, series, theme.palette.mode]);

  const dataSet = React.useMemo(() => {
    const resolvedRows = data?.rows ?? [];
    return resolvedRows.map((row) => {
      const result: NonNullable<XLineChartProps['dataset']>[number] = {};
      for (const [name, field] of Object.entries(dataProvider?.fields ?? {})) {
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
  }, [data?.rows, dataProvider?.fields]);

  return (
    <LineChartRoot
      sx={{
        [`& .${CHART_CLASS}`]: {
          visibility: error || loading ? 'hidden' : undefined,
        },
      }}
    >
      <div className={CHART_CLASS} style={{ display: 'contents' }}>
        <XLineChart dataset={dataSet} xAxis={resolvedXAxis} series={resolvedSeries} {...rest} />
      </div>
      {loading ? <LoadingOverlay /> : null}
      {error ? <ErrorOverlay error={error} /> : null}
    </LineChartRoot>
  );
}
