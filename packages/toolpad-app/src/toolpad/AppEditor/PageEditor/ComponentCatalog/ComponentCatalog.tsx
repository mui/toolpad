import * as React from 'react';
import { Box, Collapse, IconButton, Link, styled, Typography } from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ArrowDropDownSharpIcon from '@mui/icons-material/ArrowDropDownSharp';
import invariant from 'invariant';
import ComponentCatalogItem from './ComponentCatalogItem';
import CreateCodeComponentNodeDialog from '../../HierarchyExplorer/CreateCodeComponentNodeDialog';
import * as appDom from '../../../../appDom';
import { useDom } from '../../../DomLoader';
import { usePageEditorApi, usePageEditorState } from '../PageEditorProvider';
import { useToolpadComponents } from '../../toolpadComponents';

interface FutureComponentSpec {
  displayName?: string;
  displayIcon?: string;
  url: string;
}

const FUTURE_COMPONENTS = new Map<string, FutureComponentSpec>([
  ['Form', { url: 'https://github.com/mui/mui-toolpad/issues/749', displayIcon: 'Dns' }],
  ['Card', { url: 'https://github.com/mui/mui-toolpad/issues/748', displayIcon: 'ContactPage' }],
  ['Tabs', { url: 'https://github.com/mui/mui-toolpad/issues/747', displayIcon: 'Tab' }],
  ['Slider', { url: 'https://github.com/mui/mui-toolpad/issues/746', displayIcon: 'Tune' }],
  ['Switch', { url: 'https://github.com/mui/mui-toolpad/issues/745', displayIcon: 'ToggleOn' }],
  [
    'Radio',
    { url: 'https://github.com/mui/mui-toolpad/issues/744', displayIcon: 'RadioButtonChecked' },
  ],
  [
    'Date picker',
    { url: 'https://github.com/mui/mui-toolpad/issues/743', displayIcon: 'DateRange' },
  ],
  ['Checkbox', { url: 'https://github.com/mui/mui-toolpad/issues/742', displayIcon: 'CheckBox' }],
]);

const WIDTH_COLLAPSED = 50;

const ComponentCatalogRoot = styled('div')({
  position: 'relative',
  width: WIDTH_COLLAPSED + 1,
  height: '100%',
  zIndex: 1,
  overflow: 'visible',
});

export interface ComponentCatalogProps {
  className?: string;
}

export default function ComponentCatalog({ className }: ComponentCatalogProps) {
  const api = usePageEditorApi();
  const pageState = usePageEditorState();
  const dom = useDom();

  const [openStart, setOpenStart] = React.useState(0);
  const [openCustomComponents, setOpenCustomComponents] = React.useState(true);
  const [createCodeComponentDialogOpen, setCreateCodeComponentDialogOpen] = React.useState(0);
  const handleCreateCodeComponentDialogOpen = React.useCallback(() => {
    setCreateCodeComponentDialogOpen(Math.random());
  }, []);
  const handleCreateCodeComponentDialogClose = React.useCallback(
    () => setCreateCodeComponentDialogOpen(0),
    [],
  );

  const closeTimeoutRef = React.useRef<NodeJS.Timeout>();
  const openDrawer = React.useCallback(() => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
    }
    setOpenStart(Date.now());
  }, []);

  const closeDrawer = React.useCallback(
    (delay?: number) => {
      const timeOpen = Date.now() - openStart;
      const defaultDelay = timeOpen > 750 ? 500 : 0;
      closeTimeoutRef.current = setTimeout(() => setOpenStart(0), delay ?? defaultDelay);
    },
    [openStart],
  );

  const handleDragStart = (componentType: string) => (event: React.DragEvent<HTMLElement>) => {
    event.dataTransfer.dropEffect = 'copy';
    const newNode = appDom.createElement(dom, componentType, {});
    api.deselect();
    api.newNodeDragStart(newNode);
    closeDrawer(0);
  };

  const toolpadComponents = useToolpadComponents(dom);

  const handleMouseEnter = React.useCallback(() => openDrawer(), [openDrawer]);
  const handleMouseLeave = React.useCallback(() => closeDrawer(), [closeDrawer]);

  return (
    <ComponentCatalogRoot
      className={className}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          position: 'absolute',
          top: 0,
          bottom: 0,
          backgroundColor: 'background.default',
          borderRight: 1,
          borderColor: 'divider',
        }}
      >
        <Collapse in={!!openStart} orientation="horizontal" timeout={200} sx={{ height: '100%' }}>
          <Box sx={{ width: 270, height: '100%', overflow: 'auto' }}>
            <Box display="grid" gridTemplateColumns="1fr 1fr 1fr" gap={1} padding={1}>
              {Object.entries(toolpadComponents).map(([componentId, componentType]) => {
                invariant(componentType, `No component definition found for "${componentId}"`);
                return componentType.display && componentType.builtIn ? (
                  <ComponentCatalogItem
                    key={componentId}
                    draggable
                    onDragStart={handleDragStart(componentId)}
                    displayName={componentType.displayName}
                    displayIcon={componentType.displayIcon}
                    builtIn={componentType.builtIn}
                    kind={'builtIn'}
                  />
                ) : null;
              })}
            </Box>

            <Box padding={1}>
              <Box
                sx={{
                  pt: 2,
                  pb: 1,
                  px: 1,
                  borderWidth: 1,
                  borderStyle: 'inset',
                  borderColor: 'divider',
                  borderRadius: (theme) => theme.shape.borderRadius,
                }}
              >
                <Typography variant="body2" color="text.secondary">
                  More components coming soon!
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  👍 Upvote on GitHub to get it prioritized.
                </Typography>
                <Box display="grid" gridTemplateColumns="1fr 1fr 1fr" gap={1} py={1}>
                  {Array.from(
                    FUTURE_COMPONENTS,
                    ([key, { displayName = key, url, displayIcon }]) => {
                      return (
                        <Link
                          href={url}
                          underline="none"
                          target="_blank"
                          key={`futureComponent.${key}`}
                        >
                          <ComponentCatalogItem
                            displayName={displayName}
                            displayIcon={displayIcon}
                            kind={'future'}
                          />
                        </Link>
                      );
                    },
                  )}
                </Box>
              </Box>
            </Box>

            <Box px={2} pb={0} display="flex" flexDirection={'row'} justifyContent="space-between">
              <Typography variant="overline">Custom Components</Typography>
              <IconButton
                aria-label="Expand custom components"
                sx={{
                  cursor: 'pointer',
                  transform: `rotate(${openCustomComponents ? 180 : 0}deg)`,
                  transition: 'all 0.2s ease-in',
                }}
                onClick={() => setOpenCustomComponents((prev) => !prev)}
              >
                <ArrowDropDownSharpIcon />
              </IconButton>
            </Box>
            <Collapse in={openCustomComponents} orientation={'vertical'}>
              <Box display="grid" gridTemplateColumns="1fr 1fr 1fr" gap={1} padding={1} pt={0}>
                {Object.entries(toolpadComponents).map(([componentId, componentType]) => {
                  invariant(componentType, `No component definition found for "${componentId}"`);
                  return componentType.display && !componentType.builtIn ? (
                    <ComponentCatalogItem
                      key={componentId}
                      draggable
                      onDragStart={handleDragStart(componentId)}
                      displayName={componentType.displayName}
                      displayIcon={componentType.displayIcon ?? 'DashboardCustomizeSharp'}
                    />
                  ) : null;
                })}
                <ComponentCatalogItem
                  key={'create-new'}
                  displayName={'Create'}
                  displayIcon={'Add'}
                  kind={'create'}
                  onClick={handleCreateCodeComponentDialogOpen}
                />
              </Box>
            </Collapse>
          </Box>
        </Collapse>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: WIDTH_COLLAPSED,
          }}
        >
          <Box sx={{ mt: 2 }}>{openStart ? <ChevronLeftIcon /> : <ChevronRightIcon />}</Box>
          <Box position="relative">
            <Typography
              sx={{
                position: 'absolute',
                top: 0,
                display: 'flex',
                alignItems: 'center',
                fontSize: 20,
                transform: 'rotate(90deg) translate(-10px, 0)',
                transformOrigin: '0 50%',
                whiteSpace: 'nowrap',
              }}
            >
              Component library
            </Typography>
          </Box>
        </Box>
      </Box>
      <CreateCodeComponentNodeDialog
        key={createCodeComponentDialogOpen || undefined}
        appId={pageState.appId}
        open={!!createCodeComponentDialogOpen}
        onClose={handleCreateCodeComponentDialogClose}
      />
    </ComponentCatalogRoot>
  );
}
