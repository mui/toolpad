import { Stack, Typography, Divider, MenuItem, TextField } from '@mui/material';
import * as React from 'react';
import { useDom, useDomApi } from '../../AppState';
import { usePageEditorState } from './PageEditorProvider';
import QueryEditor from './QueryEditor';
import UrlQueryEditor from './UrlQueryEditor';
import NodeNameEditor from '../NodeNameEditor';
import * as appDom from '../../../appDom';

const PAGE_DISPLAY_OPTIONS: { value: appDom.PageDisplayMode; label: string }[] = [
  { value: 'shell', label: 'App shell' },
  { value: 'standalone', label: 'No shell' },
];

export default function PageOptionsPanel() {
  const { nodeId: pageNodeId } = usePageEditorState();
  const { dom } = useDom();
  const domApi = useDomApi();

  const page = appDom.getNode(dom, pageNodeId, 'page');

  const handleDisplayModeChange = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      domApi.update((draft) =>
        appDom.setNodeNamespacedProp(
          draft,
          page,
          'attributes',
          'display',
          event.target.value as appDom.PageDisplayMode,
        ),
      );
    },
    [domApi, page],
  );

  return (
    <Stack spacing={1} alignItems="start" data-testid="page-editor">
      <Typography variant="subtitle1">Page:</Typography>
      <NodeNameEditor node={page} />
      <TextField
        select
        defaultValue="shell"
        value={page.attributes.display}
        onChange={handleDisplayModeChange}
        label="Display mode"
        fullWidth
      >
        {PAGE_DISPLAY_OPTIONS.map((option) => {
          return (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          );
        })}
      </TextField>
      <Divider variant="middle" sx={{ alignSelf: 'stretch' }} />
      <Typography variant="overline">Page State:</Typography>
      <UrlQueryEditor pageNodeId={pageNodeId} />
      <QueryEditor />
    </Stack>
  );
}
