import * as React from 'react';
import { PageEditorState } from '../EditorProvider';

const PageFileEditorContext = React.createContext<PageEditorState | null>(null);

export function usePageEditorState() {
  const state = React.useContext(PageFileEditorContext);

  if (!state) {
    throw new Error(`Missing PageEditorContext`);
  }

  return state;
}

export interface PageEditorProviderProps {
  children?: React.ReactNode;
  state: PageEditorState;
}

export function PageEditorProvider({ children, state }: PageEditorProviderProps) {
  return <PageFileEditorContext.Provider value={state}>{children}</PageFileEditorContext.Provider>;
}
