import * as React from 'react';
import { QueryEditorToolsTabType } from '../../../../types';

export type QueryToolsContextProps = {
  toolsTabType: QueryEditorToolsTabType;
  handleToolsTabTypeChange: (
    event: React.SyntheticEvent,
    newValue: QueryEditorToolsTabType,
  ) => void;
  isPreviewLoading: boolean;
  setIsPreviewLoading: React.Dispatch<React.SetStateAction<boolean>>;
  handleRunPreview: () => void;
  setHandleRunPreview: React.Dispatch<React.SetStateAction<() => void>>;
};

const QueryToolsContext = React.createContext<QueryToolsContextProps>({
  toolsTabType: 'preview',
  handleToolsTabTypeChange: () => {},
  isPreviewLoading: false,
  setIsPreviewLoading: () => {},
  handleRunPreview: () => {},
  setHandleRunPreview: () => {},
});

export default QueryToolsContext;
