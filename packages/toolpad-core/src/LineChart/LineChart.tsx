'use client';

import * as React from 'react';
import PropTypes from 'prop-types';
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

export type LineChartSeries = XLineChartProps['series'];

export interface LineChartProps<R extends Datum> extends Partial<XLineChartProps> {
  dataProvider?: ResolvedDataProvider<R>;
}

/**
 *
 * Demos:
 *
 * - [Line Chart](https://mui.com/toolpad/core/react-line-chart/)
 *
 * API:
 *
 * - [LineChart API](https://mui.com/toolpad/core/api/line-chart)
 */
function LineChart<R extends Datum>(props: LineChartProps<R>) {
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
    <LineChartRoot>
      <div style={{ display: 'contents', visibility: error || loading ? 'hidden' : undefined }}>
        <XLineChart dataset={dataSet} xAxis={resolvedXAxis} series={resolvedSeries} {...rest} />
      </div>
      {loading ? <LoadingOverlay /> : null}
      {error ? <ErrorOverlay error={error} /> : null}
    </LineChartRoot>
  );
}

LineChart.propTypes /* remove-proptypes */ = {
  // ┌────────────────────────────── Warning ──────────────────────────────┐
  // │ These PropTypes are generated from the TypeScript type definitions. │
  // │ To update them, edit the TypeScript types and run `pnpm proptypes`. │
  // └─────────────────────────────────────────────────────────────────────┘
  /**
   * @ignore
   */
  children: PropTypes.node,
  /**
   * @ignore
   */
  dataProvider: PropTypes.shape({
    createOne: PropTypes.func,
    deleteOne: PropTypes.func,
    fields: PropTypes.object,
    getMany: PropTypes.func.isRequired,
    getOne: PropTypes.func,
    idField: PropTypes.object,
    updateOne: PropTypes.func,
  }),
  /**
   * The series to display in the line chart.
   * An array of [[LineSeriesType]] objects.
   */
  series: PropTypes.arrayOf(
    PropTypes.shape({
      area: PropTypes.bool,
      color: PropTypes.string,
      connectNulls: PropTypes.bool,
      curve: PropTypes.oneOf([
        'catmullRom',
        'linear',
        'monotoneX',
        'monotoneY',
        'natural',
        'step',
        'stepAfter',
        'stepBefore',
      ]),
      data: PropTypes.arrayOf(PropTypes.number),
      dataKey: PropTypes.string,
      disableHighlight: PropTypes.bool,
      highlightScope: PropTypes.shape({
        faded: PropTypes.oneOf(['global', 'none', 'series']),
        highlighted: PropTypes.oneOf(['item', 'none', 'series']),
      }),
      id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
      label: PropTypes.oneOfType([PropTypes.func, PropTypes.string]),
      showMark: PropTypes.oneOfType([PropTypes.func, PropTypes.bool]),
      stack: PropTypes.string,
      stackOffset: PropTypes.oneOf(['diverging', 'expand', 'none', 'silhouette', 'wiggle']),
      stackOrder: PropTypes.oneOf([
        'appearance',
        'ascending',
        'descending',
        'insideOut',
        'none',
        'reverse',
      ]),
      type: PropTypes.oneOf(['line']),
      valueFormatter: PropTypes.func,
      xAxisKey: PropTypes.string,
      yAxisKey: PropTypes.string,
    }),
  ),
  /**
   * The configuration of the x-axes.
   * If not provided, a default axis config is used.
   * An array of [[AxisConfig]] objects.
   */
  xAxis: PropTypes.arrayOf(
    PropTypes.shape({
      axisId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
      classes: PropTypes.object,
      colorMap: PropTypes.oneOfType([
        PropTypes.shape({
          color: PropTypes.oneOfType([
            PropTypes.arrayOf(PropTypes.string.isRequired),
            PropTypes.func,
          ]).isRequired,
          max: PropTypes.oneOfType([PropTypes.instanceOf(Date), PropTypes.number]),
          min: PropTypes.oneOfType([PropTypes.instanceOf(Date), PropTypes.number]),
          type: PropTypes.oneOf(['continuous']).isRequired,
        }),
        PropTypes.shape({
          colors: PropTypes.arrayOf(PropTypes.string).isRequired,
          thresholds: PropTypes.arrayOf(
            PropTypes.oneOfType([PropTypes.instanceOf(Date), PropTypes.number]).isRequired,
          ).isRequired,
          type: PropTypes.oneOf(['piecewise']).isRequired,
        }),
        PropTypes.shape({
          colors: PropTypes.arrayOf(PropTypes.string).isRequired,
          type: PropTypes.oneOf(['ordinal']).isRequired,
          unknownColor: PropTypes.string,
          values: PropTypes.arrayOf(
            PropTypes.oneOfType([PropTypes.instanceOf(Date), PropTypes.number, PropTypes.string])
              .isRequired,
          ),
        }),
      ]),
      data: PropTypes.array,
      dataKey: PropTypes.string,
      disableLine: PropTypes.bool,
      disableTicks: PropTypes.bool,
      fill: PropTypes.string,
      hideTooltip: PropTypes.bool,
      id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
      label: PropTypes.string,
      labelFontSize: PropTypes.number,
      labelStyle: PropTypes.object,
      max: PropTypes.oneOfType([PropTypes.instanceOf(Date), PropTypes.number]),
      min: PropTypes.oneOfType([PropTypes.instanceOf(Date), PropTypes.number]),
      position: PropTypes.oneOf(['bottom', 'left', 'right', 'top']),
      reverse: PropTypes.bool,
      scaleType: PropTypes.oneOf(['band', 'linear', 'log', 'point', 'pow', 'sqrt', 'time', 'utc']),
      slotProps: PropTypes.shape({
        axisLabel: PropTypes.object,
        axisLine: PropTypes.object,
        axisTick: PropTypes.object,
        axisTickLabel: PropTypes.object,
      }),
      slots: PropTypes.shape({
        axisLabel: PropTypes.elementType,
        axisLine: PropTypes.elementType,
        axisTick: PropTypes.elementType,
        axisTickLabel: PropTypes.elementType,
      }),
      stroke: PropTypes.string,
      tickFontSize: PropTypes.number,
      tickInterval: PropTypes.oneOfType([
        PropTypes.oneOf(['auto']),
        PropTypes.array,
        PropTypes.func,
      ]),
      tickLabelInterval: PropTypes.oneOfType([PropTypes.oneOf(['auto']), PropTypes.func]),
      tickLabelPlacement: PropTypes.oneOf(['middle', 'tick']),
      tickLabelStyle: PropTypes.object,
      tickMaxStep: PropTypes.number,
      tickMinStep: PropTypes.number,
      tickNumber: PropTypes.number,
      tickPlacement: PropTypes.oneOf(['end', 'extremities', 'middle', 'start']),
      tickSize: PropTypes.number,
      valueFormatter: PropTypes.func,
    }),
  ),
} as any;

export { LineChart };
