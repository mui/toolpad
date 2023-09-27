import * as React from 'react';
import { QueryEditorToolsTab } from '../../../../../types';

export type QueryToolsContextProps = {
  toolsTab: QueryEditorToolsTab;
  handleToolsTabChange: (event: React.SyntheticEvent, newValue: QueryEditorToolsTab) => void;
  isPreviewLoading: boolean;
  setIsPreviewLoading: React.Dispatch<React.SetStateAction<boolean>>;
  handleRunPreview: () => void;
  setHandleRunPreview: React.Dispatch<React.SetStateAction<() => void>>;
};

const QueryToolsContext = React.createContext<QueryToolsContextProps>({
  toolsTab: 'preview',
  handleToolsTabChange: () => {},
  isPreviewLoading: false,
  setIsPreviewLoading: () => {},
  handleRunPreview: () => {},
  setHandleRunPreview: () => {},
});

export default QueryToolsContext;
