import {
  Stack,
  Typography,
  Divider,
  Tooltip,
  Link,
  ToggleButtonGroup,
  ToggleButton,
} from '@mui/material';
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
    (event: React.MouseEvent<HTMLElement>, newValue: appDom.PageDisplayMode) => {
      domApi.update((draft) =>
        appDom.setNodeNamespacedProp(draft, page, 'attributes', 'display', newValue),
      );
    },
    [domApi, page],
  );

  return (
    <Stack spacing={1} alignItems="start" data-testid="page-editor">
      <Typography variant="subtitle1">Page:</Typography>
      <NodeNameEditor node={page} />
      <PageTitleEditor node={page} />
      <Typography variant="body2">Display mode:</Typography>
      <Tooltip
        arrow
        placement="left-start"
        title={
          <Typography variant="inherit">
            Control how the navigation panel is rendered in the final application. Read more in the{' '}
            <Link
              href="https://mui.com/toolpad/concepts/page-properties/#display-mode"
              target="_blank"
              rel="noopener"
            >
              docs
            </Link>
            .
          </Typography>
        }
      >
        <ToggleButtonGroup
          exclusive
          value={page.attributes.display ?? 'shell'}
          onChange={handleDisplayModeChange}
          aria-label="Display mode"
          fullWidth
        >
          {PAGE_DISPLAY_OPTIONS.map((option) => {
            return (
              <ToggleButton key={option.value} value={option.value}>
                {option.label}
              </ToggleButton>
            );
          })}
        </ToggleButtonGroup>
      </Tooltip>
      {appDom.isCodePage(page) ? null : (
        <React.Fragment>
          <Divider variant="middle" sx={{ alignSelf: 'stretch' }} />
          <Typography variant="overline">Page State:</Typography>
          <UrlQueryEditor pageNodeId={pageNodeId} />
          <QueryEditor />
        </React.Fragment>
      )}
    </Stack>
  );
}
