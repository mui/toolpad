import * as React from 'react';

import { CircularProgress, Box, BoxProps } from '@mui/material';

import {
  BarPlot,
  LinePlot,
  AreaPlot,
  ScatterPlot,
  MarkPlot,
  BarSeriesType,
  LineSeriesType,
  ScatterSeriesType,
  ScaleName,
} from '@mui/x-charts';
import { ResponsiveChartContainer } from '@mui/x-charts/ResponsiveChartContainer';
import { ChartsXAxis } from '@mui/x-charts/ChartsXAxis';
import { ChartsYAxis } from '@mui/x-charts/ChartsYAxis';
import { ChartsLegend } from '@mui/x-charts/ChartsLegend';
import { ChartsTooltip } from '@mui/x-charts/ChartsTooltip';
import { ChartsAxisHighlight } from '@mui/x-charts/ChartsAxisHighlight';
import { errorFrom } from '@mui/toolpad-utils/errors';
import createBuiltin from './createBuiltin';
import ErrorOverlay from './components/ErrorOverlay';
import { SX_PROP_HELPER_TEXT } from './constants';

type ChartDataSeriesKind = 'line' | 'bar' | 'area' | 'scatter';

export const CHART_DATA_SERIES_KINDS: ChartDataSeriesKind[] = ['line', 'bar', 'area', 'scatter'];

export interface ChartDataSeries<D = Record<string, string | number>> {
  kind: ChartDataSeriesKind;
  label: string;
  data?: D[];
  xKey?: keyof D;
  yKey?: keyof D;
  color?: string;
}

export type ChartData = ChartDataSeries[];

function hasOnlyNumbers(array: unknown[]): boolean {
  return array.every((item) => typeof item === 'number');
}

function getChartType(kind: ChartDataSeriesKind): 'line' | 'bar' | 'scatter' {
  switch (kind) {
    case 'bar':
      return 'bar';
    case 'scatter':
      return 'scatter';
    default:
      return 'line';
  }
}

interface ChartProps extends BoxProps {
  data?: ChartData;
  loading?: boolean;
  error?: Error | string;
  height: number;
}

function Chart({ data = [], loading, error, height, sx }: ChartProps) {
  const hasData =
    data.length > 0 &&
    data.some((dataSeries) => (dataSeries.data ? dataSeries.data.length > 0 : false));

  const xValues = React.useMemo(
    () =>
      data
        .flatMap((dataSeries) => {
          if (!dataSeries.xKey || !dataSeries.data) {
            return [];
          }
          return dataSeries.data.map((dataSeriesPoint) => dataSeriesPoint[dataSeries.xKey!]);
        })
        .filter((value, index, array) => value !== undefined && array.indexOf(value) === index)
        .sort((a: number | string, b: number | string) => {
          if (typeof a === 'number' && typeof b === 'number') {
            return (a as number) - (b as number);
          }
          return 0;
        }),
    [data],
  );

  const chartSeries: (BarSeriesType | LineSeriesType | ScatterSeriesType)[] = React.useMemo(
    () =>
      data
        .filter((dataSeries) => dataSeries.xKey && dataSeries.yKey)
        .map((dataSeries) => {
          const yValues = xValues.map((xValue) => {
            const point = (dataSeries.data || []).find(
              (dataSeriesPoint) => dataSeriesPoint[dataSeries.xKey!] === xValue,
            );

            return (point && point[dataSeries.yKey!]) || 0;
          });

          const chartType = getChartType(dataSeries.kind);

          const baseProps = {
            type: chartType,
            xAxisKey: 'x',
            yAxisKey: dataSeries.yKey,
            label: dataSeries.label,
            color: dataSeries.color,
          };

          if (chartType === 'scatter') {
            return {
              ...baseProps,
              data: yValues.map((y, index) => ({
                x: xValues[index],
                y,
                id: `${dataSeries.yKey}-${index}`,
              })),
            } as ScatterSeriesType;
          }
          if (chartType === 'line') {
            return {
              ...baseProps,
              data: yValues,
              area: dataSeries.kind === 'area',
            } as LineSeriesType;
          }

          return {
            ...baseProps,
            data: yValues,
          } as BarSeriesType;
        })
        .filter((dataSeries) => dataSeries.data && dataSeries.data.length > 0),
    [data, xValues],
  );

  const displayError = error ? errorFrom(error) : null;

  const isDataVisible = !loading && !displayError;

  const hasBarCharts = chartSeries.some(
    (dataSeries) => dataSeries.type === 'bar' && dataSeries.data && hasOnlyNumbers(dataSeries.data),
  );
  const hasLineCharts = chartSeries.some(
    (dataSeries) =>
      dataSeries.type === 'line' && dataSeries.data && hasOnlyNumbers(dataSeries.data),
  );
  const hasAreaCharts = chartSeries.some(
    (dataSeries) =>
      dataSeries.type === 'line' &&
      dataSeries.data &&
      hasOnlyNumbers(dataSeries.data) &&
      dataSeries.area,
  );
  const hasScatterCharts = chartSeries.some(
    (dataSeries) =>
      dataSeries.type === 'scatter' &&
      dataSeries.data &&
      hasOnlyNumbers(dataSeries.data.map((point) => point.x)) &&
      hasOnlyNumbers(dataSeries.data.map((point) => point.y)),
  );

  const hasOnlyNumberXValues = hasOnlyNumbers(xValues);

  let xScaleType: ScaleName = 'point';
  if (hasBarCharts) {
    xScaleType = 'band';
  }

  const firstDataSeries = chartSeries[0];

  return (
    <Box sx={{ ...sx, position: 'relative', minHeight: height, width: '100%' }} aria-busy={loading}>
      {displayError ? <ErrorOverlay error={displayError} /> : null}
      {loading && !error ? (
        <div
          style={{
            position: 'absolute',
            inset: '0 0 0 0',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <CircularProgress />
        </div>
      ) : null}
      {isDataVisible ? (
        <ResponsiveChartContainer
          series={chartSeries}
          height={height}
          xAxis={[
            {
              id: 'x',
              data: xValues,
              scaleType: xScaleType,
              min: hasOnlyNumberXValues ? Math.min(...(xValues as number[])) : undefined,
              max: hasOnlyNumberXValues ? Math.max(...(xValues as number[])) : undefined,
            },
          ]}
          yAxis={
            firstDataSeries
              ? chartSeries.map((dataSeries) => ({
                  id: dataSeries?.yAxisKey || 'y',
                  scaleType: 'linear',
                }))
              : [
                  {
                    id: 'y',
                    scaleType: 'linear',
                  },
                ]
          }
          margin={{ left: 80, top: 60 }}
          sx={{
            '.MuiMarkElement-root': {
              scale: '0.8',
            },
          }}
        >
          <ChartsXAxis position="bottom" axisId="x" />
          <ChartsYAxis
            key={firstDataSeries?.yAxisKey || 'y'}
            position="left"
            axisId={firstDataSeries?.yAxisKey || 'y'}
          />
          {hasBarCharts ? <BarPlot /> : null}
          {hasAreaCharts ? <AreaPlot /> : null}
          {hasLineCharts ? (
            <React.Fragment>
              <LinePlot />
              <MarkPlot />
            </React.Fragment>
          ) : null}
          {hasScatterCharts ? <ScatterPlot /> : null}
          {hasData ? (
            <React.Fragment>
              <ChartsLegend />
              <ChartsTooltip />
              <ChartsAxisHighlight x={hasBarCharts ? 'band' : 'line'} />
            </React.Fragment>
          ) : null}
        </ResponsiveChartContainer>
      ) : null}
    </Box>
  );
}

export default createBuiltin(Chart, {
  helperText: 'A chart component.',
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
      helperText: 'The height of the chart.',
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
