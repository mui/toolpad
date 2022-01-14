import { DataGridProProps, DataGridPro, LicenseInfo } from '@mui/x-data-grid-pro';
import * as React from 'react';
import { createComponent } from '@mui/studio-core';

// TODO: Generate a specific license for Studio (This one comes from CI)
const LICENSE =
  '0f94d8b65161817ca5d7f7af8ac2f042T1JERVI6TVVJLVN0b3J5Ym9vayxFWFBJUlk9MTY1NDg1ODc1MzU1MCxLRVlWRVJTSU9OPTE=';

LicenseInfo.setLicenseKey(LICENSE);

interface DataGridWithQueryProps extends DataGridProProps {
  studioDataQuery: string | null;
}

const DataGridComponent = React.forwardRef(function DataGridComponent(
  props: DataGridWithQueryProps,
  ref: React.ForwardedRef<HTMLDivElement>,
) {
  return (
    <div ref={ref} style={{ height: 350, width: '100%' }}>
      <DataGridPro {...props} />
    </div>
  );
});

export default createComponent(DataGridComponent, {
  argTypes: {
    rows: {
      typeDef: { type: 'array', items: { type: 'object' } },
      defaultValue: [],
    },
    columns: {
      typeDef: { type: 'array', items: { type: 'object' } },
      defaultValue: [],
    },
    studioDataQuery: {
      typeDef: { type: 'dataQuery' },
    },
  },
});
