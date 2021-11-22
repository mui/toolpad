import * as React from 'react';
import { StudioPage } from '../../types';

const PageContext = React.createContext<StudioPage | null>(null);

export function useCurrentPage(): StudioPage {
  const page = React.useContext(PageContext);
  if (!page) {
    throw new Error('Invariant: hook used outside of a page context');
  }
  return page;
}

export default PageContext;
