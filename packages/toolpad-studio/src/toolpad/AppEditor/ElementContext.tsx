import * as React from 'react';
import * as appDom from '@toolpad/studio-runtime/appDom';

export default React.createContext<appDom.ElementNode | undefined>(undefined);
