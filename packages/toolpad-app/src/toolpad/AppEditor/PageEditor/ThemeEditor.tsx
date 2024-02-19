import * as React from 'react';
import * as appDom from '@mui/toolpad-core/appDom';
import { useAppState, useDomApi } from '../../AppState';
import MuiThemeEditor from '../../../components/MuiThemeEditor';

export interface ComponentEditorProps {
  className?: string;
}

export default function ComponentEditor({ className }: ComponentEditorProps) {
  const { dom } = useAppState();
  const domApi = useDomApi();

  const app = appDom.getApp(dom);
  const { themes = [] } = appDom.getChildNodes(dom, app);
  const theme = themes.length > 0 ? themes[0] : null;

  return (
    <div className={className} data-testid="theme-editor">
      <MuiThemeEditor
        value={theme?.theme || {}}
        onChange={(newTheme) => {
          domApi.update((draft) => {
            if (theme) {
              draft = appDom.setNodeProp(draft, theme, 'theme', newTheme);
              return draft;
            }

            const newThemeNode = appDom.createNode(dom, 'theme', {
              name: 'Theme',
              theme: newTheme,
              attributes: {},
            });
            draft = appDom.addNode(draft, newThemeNode, app, 'themes');
            return draft;
          });
        }}
      />
    </div>
  );
}
