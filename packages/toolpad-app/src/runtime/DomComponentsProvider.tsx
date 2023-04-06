import * as React from 'react';
import { ComponentsContextProvider } from '@mui/toolpad-core';
import AppLoading from './AppLoading';
import * as appDom from '../appDom';

function DomComponentsLoader() {
  return <ComponentsContextProvider />;
}

interface DomComponentsProvider {
  dom: appDom.AppDom;
}

export default function DomComponentsProvider({ dom }) {
  const [loading, setLoading] = React.useState(true);
  React.useEffect(() => {}, []);
  return (
    <React.Suspense fallback={<AppLoading />}>
      <DomComponentsLoader />
    </React.Suspense>
  );
}
