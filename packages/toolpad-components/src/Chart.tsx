import * as React from 'react';
import { createComponent } from '@mui/toolpad-core';
import { ContainerProps, Container, Skeleton } from '@mui/material';
import {
  BarPlot,
  LinePlot,
  ScatterPlot,
  BarSeriesType,
  LineSeriesType,
  ScatterSeriesType,
  ScaleName,
} from '@mui/x-charts';
import { ChartContainer } from '@mui/x-charts/ChartContainer';
import { ChartsXAxis } from '@mui/x-charts/ChartsXAxis';
import { ChartsYAxis } from '@mui/x-charts/ChartsYAxis';
import { ChartsLegend } from '@mui/x-charts/ChartsLegend';
import { ChartsTooltip } from '@mui/x-charts/ChartsTooltip';
import { ChartsAxisHighlight } from '@mui/x-charts/ChartsAxisHighlight';
import { errorFrom } from '@mui/toolpad-utils/errors';
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

interface ChartProps extends ContainerProps {
  data?: ChartData;
  loading?: boolean;
  error?: Error | string;
  height: number;
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

  const chartSeries: (BarSeriesType | LineSeriesType | ScatterSeriesType)[] = React.useMemo(
    () =>
      data
        .filter((dataSeries) => dataSeries.xKey && dataSeries.yKey)
        .map((dataSeries) => {
          const yValues = xValues.map((xValue) => {
            const point = (dataSeries.data || []).find(
              (dataSeriesPoint) => dataSeriesPoint[dataSeries.xKey!] === xValue,
            );

            return point ? point[dataSeries.yKey!] : 0;
          });

          const chartType = getChartType(dataSeries.kind);

          const baseProps = {
            type: chartType,
            xAxisKey: dataSeries.xKey,
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
        }),
    [data, xValues],
  );

  const hasNonNumberXValues = xValues.some((xValue) => typeof xValue !== 'number');

  const displayError = error ? errorFrom(error) : null;

  const isDataVisible = !loading && !displayError;

  const isEmpty =
    (!loading && !displayError && chartSeries.length <= 0) ||
    !chartSeries.find((dataSeries) => (dataSeries.data ?? []).length > 0);

  const hasBarCharts = chartSeries.some((dataSeries) => dataSeries.type === 'bar');

  const hasXOnlyIntegers = xValues.every((x) => Number.isInteger(x));

  let xScaleType: ScaleName = 'linear';
  if (hasXOnlyIntegers) {
    xScaleType = 'point';
  }
  if (hasBarCharts) {
    xScaleType = 'band';
  }

  return (
    <Container disableGutters sx={{ ...sx, position: 'relative' }} aria-busy={loading}>
      <ErrorOverlay error={displayError} />
      {loading && !error ? (
        <Skeleton
          sx={{ position: 'absolute', inset: '0 0 0 0' }}
          variant="rectangular"
          width="100%"
          height={height}
        />
      ) : null}
      {isDataVisible ? (
        <ChartContainer
          series={chartSeries}
          height={height}
          width={1000}
          xAxis={[
            {
              id: 'x',
              data: xValues,
              scaleType: xScaleType,
              min: hasNonNumberXValues ? undefined : Math.min(...(xValues as number[])),
              max: hasNonNumberXValues ? undefined : Math.max(...(xValues as number[])),
            },
          ]}
          yAxis={
            isEmpty
              ? [
                  {
                    id: 'y',
                    scaleType: 'linear',
                  },
                ]
              : chartSeries.map((dataSeries) => ({
                  id: dataSeries?.yAxisKey || 'y',
                  scaleType: 'linear',
                }))
          }
          sx={{
            '--ChartsLegend-rootSpacing': '25px',
          }}
        >
          <ChartsXAxis label={chartSeries[0]?.xAxisKey} position="bottom" axisId="x" />
          {isEmpty ? (
            <ChartsYAxis key="y" position="left" axisId="y" disableTicks tickFontSize={0} />
          ) : (
            chartSeries
              // Filter by unique yAxisKey
              .filter(
                (dataSeries, index, array) =>
                  dataSeries.yAxisKey &&
                  array.findIndex(
                    (otherDataSeries) => otherDataSeries.yAxisKey === dataSeries.yAxisKey,
                  ) === index,
              )
              .map(({ yAxisKey }) => (
                <ChartsYAxis
                  key={yAxisKey}
                  label={yAxisKey}
                  position="left"
                  axisId={yAxisKey as string}
                />
              ))
          )}
          {chartSeries.some((dataSeries) => dataSeries.type === 'line') ? <LinePlot /> : null}
          {hasBarCharts ? <BarPlot /> : null}
          {chartSeries.some((dataSeries) => dataSeries.type === 'scatter') ? <ScatterPlot /> : null}
          <ChartsLegend />
          <ChartsTooltip />
          <ChartsAxisHighlight x={hasBarCharts ? 'band' : 'line'} />
        </ChartContainer>
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
