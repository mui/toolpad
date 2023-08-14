import * as React from 'react';
import { createComponent } from '@mui/toolpad-core';
import { Container, ContainerProps, Skeleton } from '@mui/material';
import {
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Line,
  ResponsiveContainer,
  CartesianGrid,
  ComposedChart,
  Bar,
  Area,
  Scatter,
} from 'recharts';
import { errorFrom } from '@mui/toolpad-utils/errors';
import ErrorOverlay from './components/ErrorOverlay';
import { SX_PROP_HELPER_TEXT } from './constants';

export const CHART_DATA_SERIES_KINDS = ['line', 'bar', 'area', 'scatter'];

export interface ChartDataSeries<D = Record<string, string | number>> {
  kind: (typeof CHART_DATA_SERIES_KINDS)[number];
  label: string;
  data?: D[];
  xKey?: keyof D;
  yKey?: keyof D;
  color?: string;
}

export type ChartData = ChartDataSeries[];

function getBarChartDataSeriesNormalizedYKey(dataSeries: ChartDataSeries, index: number): string {
  return `${dataSeries.label}-${dataSeries.yKey}-${index}`;
}

interface ChartProps extends ContainerProps {
  data?: ChartData;
  loading?: boolean;
  error?: Error | string;
  height?: number;
}

function Chart({ data = [], loading, error, height, sx }: ChartProps) {
  const xValues = React.useMemo(
    () =>
      data
        .flatMap((dataSeries) => {
          if (!dataSeries.xKey || !dataSeries.data) {
            return [];
          }
          return dataSeries.data.map((dataSeriesPoint) => dataSeriesPoint[dataSeries.xKey!]);
        })
        .filter((value, index, array) => array.indexOf(value) === index)
        .sort((a: number | string, b: number | string) =>
          typeof a === 'number' && typeof b === 'number' ? a - b : 0,
        ),
    [data],
  );

  const barChartData = React.useMemo(() => {
    return xValues.map((xValue) => {
      const yValues = data.reduce((acc, dataSeries, index) => {
        if (dataSeries.kind !== 'bar' || !dataSeries.xKey || !dataSeries.yKey) {
          return acc;
        }

        const point = (dataSeries.data || []).find(
          (dataSeriesPoint) => dataSeriesPoint[dataSeries.xKey!] === xValue,
        );

        return {
          ...acc,
          [getBarChartDataSeriesNormalizedYKey(dataSeries, index)]: point
            ? point[dataSeries.yKey]
            : 0,
        };
      }, {});

      return {
        x: xValue,
        ...yValues,
      };
    });
  }, [data, xValues]);

  const hasNonNumberXValues = xValues.some((xValue) => typeof xValue !== 'number');

  const displayError = error ? errorFrom(error) : null;

  const isDataVisible = !loading && !displayError;

  return (
    <Container disableGutters sx={{ ...sx, position: 'relative' }} aria-busy={loading}>
      <ResponsiveContainer width="100%" height={height}>
        <ComposedChart data={barChartData} margin={{ top: 20, right: 80 }}>
          {isDataVisible ? (
            <React.Fragment>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="x"
                type={hasNonNumberXValues ? 'category' : 'number'}
                allowDuplicatedCategory={false}
                domain={
                  hasNonNumberXValues
                    ? undefined
                    : [Math.min(...(xValues as number[])), Math.max(...(xValues as number[]))]
                }
              />
              <YAxis width={80} />
              <Tooltip />
              <Legend />
              {data.map((dataSeries, index) => {
                if (
                  !dataSeries.data ||
                  dataSeries.data.length === 0 ||
                  !dataSeries.xKey ||
                  !dataSeries.yKey
                ) {
                  return null;
                }

                const key = `${dataSeries.label}-${index}`;

                const normalizedData = dataSeries.data
                  .map((dataSeriesPoint) => ({
                    x: dataSeriesPoint[dataSeries.xKey!],
                    [dataSeries.yKey!]: dataSeriesPoint[dataSeries.yKey!],
                  }))
                  .sort((a, b) =>
                    typeof a[dataSeries.xKey!] === 'number' &&
                    typeof b[dataSeries.xKey!] === 'number'
                      ? (a[dataSeries.xKey!] as number) - (b[dataSeries.xKey!] as number)
                      : 0,
                  );

                switch (dataSeries.kind) {
                  case 'bar':
                    return (
                      <Bar
                        key={key}
                        dataKey={getBarChartDataSeriesNormalizedYKey(dataSeries, index)}
                        name={dataSeries.label}
                        barSize={20}
                        fill={dataSeries.color}
                      />
                    );
                  case 'area':
                    return (
                      <Area
                        key={key}
                        type="monotone"
                        data={normalizedData}
                        dataKey={dataSeries.yKey}
                        name={dataSeries.label}
                        stroke={dataSeries.color}
                        fill={dataSeries.color}
                      />
                    );
                  case 'scatter':
                    return (
                      <Scatter
                        key={key}
                        data={normalizedData}
                        dataKey={dataSeries.yKey}
                        name={dataSeries.label}
                        fill={dataSeries.color}
                      />
                    );
                  default:
                    return (
                      <Line
                        key={key}
                        type="monotone"
                        data={normalizedData}
                        dataKey={dataSeries.yKey}
                        name={dataSeries.label}
                        stroke={dataSeries.color}
                      />
                    );
                }
              })}
            </React.Fragment>
          ) : null}
        </ComposedChart>
      </ResponsiveContainer>
      <ErrorOverlay error={displayError} />
      {loading && !error ? (
        <Skeleton
          sx={{ position: 'absolute', inset: '0 0 0 0' }}
          variant="rectangular"
          width="100%"
          height={height}
        />
      ) : null}
    </Container>
  );
}

export default createComponent(Chart, {
  loadingProp: 'loading',
  loadingPropSource: ['data'],
  errorProp: 'error',
  resizableHeightProp: 'height',
  argTypes: {
    data: {
      helperText: 'The data to be displayed.',
      type: 'array',
      schema: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            kind: {
              type: 'string',
              enum: CHART_DATA_SERIES_KINDS,
              default: 'line',
            },
            label: {
              type: 'string',
            },
            data: {
              type: 'object',
              default: [],
            },
            xKey: {
              type: 'string',
            },
            yKey: {
              type: 'string',
            },
            color: {
              type: 'string',
            },
          },
        },
      },
      control: { type: 'ChartData', bindable: false },
    },
    height: {
      type: 'number',
      default: 300,
      minimum: 100,
    },
    sx: {
      helperText: SX_PROP_HELPER_TEXT,
      type: 'object',
    },
  },
});
