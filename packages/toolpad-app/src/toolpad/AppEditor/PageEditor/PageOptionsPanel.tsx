import { Stack, Typography, Divider, MenuItem, TextField, Tooltip, Link } from '@mui/material';
import * as React from 'react';
import { useAppState, useDomApi } from '../../AppState';
import { usePageEditorState } from './PageEditorProvider';
import QueryEditor from './QueryEditor';
import UrlQueryEditor from './UrlQueryEditor';
import NodeNameEditor from '../NodeNameEditor';
import * as appDom from '../../../appDom';
import PageTitleEditor from '../PageTitleEditor';

const PAGE_DISPLAY_OPTIONS: { value: appDom.PageDisplayMode; label: string }[] = [
  { value: 'shell', label: 'App shell' },
  { value: 'standalone', label: 'No shell' },
];

export default function PageOptionsPanel() {
  const { nodeId: pageNodeId } = usePageEditorState();
  const { dom } = useAppState();
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
      <PageTitleEditor node={page} />
      <Tooltip
        arrow
        placement="left-start"
        title={
          <Typography variant="inherit">
            Control how the navigation panel is rendered in the final application. Read more in the{' '}
            <Link
              href="https://mui.com/toolpad/concepts/display-mode/"
              target="_blank"
              rel="noopener"
            >
              docs
            </Link>
            .
          </Typography>
        }
      >
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
      </Tooltip>
      <Divider variant="middle" sx={{ alignSelf: 'stretch' }} />
      <Typography variant="overline">Page State:</Typography>
      <UrlQueryEditor pageNodeId={pageNodeId} />
      <QueryEditor />
    </Stack>
  );
}
