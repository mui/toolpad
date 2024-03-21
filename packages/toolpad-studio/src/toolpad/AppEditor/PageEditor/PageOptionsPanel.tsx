import {
  Stack,
  Typography,
  Divider,
  Tooltip,
  Link,
  ToggleButtonGroup,
  ToggleButton,
  Autocomplete,
  TextField,
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import * as React from 'react';
import * as appDom from '@toolpad/studio-runtime/appDom';
import { useAppState, useDomApi } from '../../AppState';
import { usePageEditorState } from './PageEditorProvider';

import UrlQueryEditor from './UrlQueryEditor';
import NodeNameEditor from '../NodeNameEditor';
import PageTitleEditor from '../PageTitleEditor';
import { UpgradeAlert } from '../UpgradeAlert';
import PageDisplayNameEditor from '../PageDisplayNameEditor';

const PAGE_DISPLAY_OPTIONS: { value: appDom.PageDisplayMode; label: string }[] = [
  { value: 'shell', label: 'App shell' },
  { value: 'standalone', label: 'No shell' },
];

export default function PageOptionsPanel() {
  const { nodeId: pageNodeId } = usePageEditorState();
  const { dom } = useAppState();
  const plan = appDom.getPlan(dom);
  const isPaidPlan = plan !== undefined && plan !== 'free';
  const domApi = useDomApi();

  const appNode = appDom.getApp(dom);

  const page = appDom.getNode(dom, pageNodeId, 'page');
  const handleDisplayModeChange = React.useCallback(
    (event: React.MouseEvent<HTMLElement>, newValue: appDom.PageDisplayMode) => {
      domApi.update((draft) =>
        appDom.setNodeNamespacedProp(draft, page, 'attributes', 'display', newValue),
      );
    },
    [domApi, page],
  );

  const availableRoles = React.useMemo(() => {
    return new Map(appNode.attributes?.authorization?.roles?.map((role) => [role.name, role]));
  }, [appNode]);

  const handleAllowedRolesChange = React.useCallback(
    (event: React.SyntheticEvent, newValue: string[]) => {
      domApi.update((draft) =>
        appDom.setNodeNamespacedProp(draft, page, 'attributes', 'authorization', {
          ...page.attributes.authorization,
          allowedRoles: newValue,
        }),
      );
    },
    [domApi, page],
  );

  const handleAllowAllChange = React.useCallback(
    (event: React.SyntheticEvent, isAllowed: boolean) => {
      domApi.update((draft) =>
        appDom.setNodeNamespacedProp(draft, page, 'attributes', 'authorization', {
          allowAll: isAllowed,
          ...(isAllowed ? { allowedRoles: [] } : {}),
        }),
      );
    },
    [domApi, page],
  );

  const allowAll = page.attributes.authorization?.allowAll ?? true;
  const allowedRoles = page.attributes.authorization?.allowedRoles ?? [];

  return (
    <Stack spacing={2} alignItems="stretch" data-testid="page-editor">
      <Typography variant="subtitle1">Page:</Typography>
      <div>
        <NodeNameEditor node={page} />
        <PageDisplayNameEditor node={page} />
        <PageTitleEditor node={page} />
      </div>
      <div>
        <Typography variant="body2">Display mode:</Typography>
        <Tooltip
          arrow
          placement="left-start"
          title={
            <Typography variant="inherit">
              Control how the app shell is displayed in the final application. Read more in the{' '}
              <Link
                href="https://mui.com/toolpad/studio/concepts/page-properties/#display-mode"
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
      </div>
      <div>
        <Typography variant="body2">Authorization:</Typography>
        {isPaidPlan ? (
          <React.Fragment>
            <FormControlLabel
              control={<Checkbox checked={allowAll} onChange={handleAllowAllChange} />}
              label="Allow access to all roles"
            />
            <Autocomplete
              multiple
              options={Array.from(availableRoles.keys())}
              value={allowAll ? [] : allowedRoles}
              onChange={handleAllowedRolesChange}
              disabled={allowAll}
              fullWidth
              noOptionsText="No roles defined"
              renderInput={(params) => (
                <TextField {...params} label="Allowed roles" placeholder="Roles" />
              )}
            />
          </React.Fragment>
        ) : (
          <UpgradeAlert feature="Role based access control" hideAction />
        )}
      </div>
      {appDom.isCodePage(page) ? null : (
        <div>
          <Divider variant="middle" sx={{ alignSelf: 'stretch' }} />
          <Typography variant="overline">Page State:</Typography>
          <UrlQueryEditor pageNodeId={pageNodeId} />
        </div>
      )}
    </Stack>
  );
}
