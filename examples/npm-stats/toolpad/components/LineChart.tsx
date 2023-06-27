import * as React from 'react';
import { createComponent } from '@mui/toolpad/browser';
import CircularProgress from '@mui/material/CircularProgress';
import { LineChart as MuiLineChart } from '@mui/x-charts/LineChart';

export interface LineChartProps {
  data: object[];
  loading?: boolean;
}

function ChartExport({ loading, data }: LineChartProps) {
  const rootRef = React.useRef<HTMLDivElement>(null);
  const [size, setSize] = React.useState({ clientWidth: 0, clientHeight: 0 });

  React.useEffect(() => {
    const element = rootRef.current;

    if (!element) {
      return () => {};
    }

    const observer = new ResizeObserver(() => {
      const { clientWidth, clientHeight } = element;
      setSize({ clientWidth, clientHeight });
    });

    observer.observe(element);
    return () => {
      // Cleanup the observer by unobserving all elements
      observer.disconnect();
    };
  }, []);

  const xAxis = data.map((datum: any) => new Date(datum.day));
  const yAxis = data.map((datum: any) => datum.downloads ?? 0);

  return (
    <div ref={rootRef} style={{ position: 'relative', width: '100%', height: 300 }}>
      {loading || data.length <= 0 ? (
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
      ) : (
        <MuiLineChart
          width={size.clientWidth}
          height={size.clientHeight}
          series={[{ data: yAxis, label: 'downloads' }]}
          xAxis={[{ scaleType: 'time', data: xAxis }]}
        />
      )}
    </div>
  );
}

export default createComponent(ChartExport, {
  loadingProp: 'loading',
  argTypes: {
    data: {
      type: 'array',
      defaultValue: [],
    },
  },
});
