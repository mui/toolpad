'use client';

import * as React from 'react';
import ToolpadApp, { ToolpadAppProps } from '../runtime/ToolpadApp';
import { AppContext, AppContextValue } from '../runtime/AppContext';

const appContext: AppContextValue = {
  isPreview: false,
  isCustomServer: true,
};

export default function ToolpadAppClient(props: ToolpadAppProps) {
  return (
    <AppContext.Provider value={appContext}>
      <ToolpadApp {...props} />
    </AppContext.Provider>
  );
}
