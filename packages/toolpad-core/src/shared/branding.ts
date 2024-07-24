import * as React from 'react';
import { BrandingContext } from './context';

export function useApplicationTitle() {
  const branding = React.useContext(BrandingContext);
  return branding?.title ?? 'Toolpad';
}
