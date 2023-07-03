import * as React from 'react';
import { Button } from '@mui/material';
import * as appDom from '../../../appDom';
import { useDom, useDomApi } from '../../AppState';
import MuiThemeEditor from '../../../components/MuiThemeEditor';

export interface ComponentEditorProps {
  className?: string;
}

export default function ComponentEditor({ className }: ComponentEditorProps) {
  const { dom } = useDom();
  const domApi = useDomApi();

  const app = appDom.getApp(dom);
  const { themes = [] } = appDom.getChildNodes(dom, app);
  const theme = themes.length > 0 ? themes[0] : null;

  const handleAddThemeClick = () => {
    const newTheme = appDom.createNode(dom, 'theme', {
      name: 'Theme',
      theme: {},
      attributes: {},
    });
    domApi.update((draft) => appDom.addNode(draft, newTheme, app, 'themes'));
  };

  return (
    <div className={className} data-testid="theme-editor">
      {theme ? (
        <MuiThemeEditor
          value={theme.theme || {}}
          onChange={(newTheme) => {
            domApi.update((draft) => {
              draft = appDom.setNodeProp(draft, theme, 'theme', newTheme);
              return draft;
            });
          }}
        />
      ) : (
        <Button onClick={handleAddThemeClick}>Add theme</Button>
      )}
    </div>
  );
}
