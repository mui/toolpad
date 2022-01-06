import * as React from 'react';
import * as studioDom from '../../studioDom';
import { useEditorState } from './EditorProvider';

export interface ThemeFileEditorProps {
  className?: string;
}

export default function ThemeFileEditor({ className }: ThemeFileEditorProps) {
  const state = useEditorState();
  const app = studioDom.getApp(state.dom);
  const theme = studioDom.getTheme(state.dom, app);
  return (
    <div className={className}>
      <pre>{theme?.content ?? '// No theme yet'}</pre>
    </div>
  );
}
