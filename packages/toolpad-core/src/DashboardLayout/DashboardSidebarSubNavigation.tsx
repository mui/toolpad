'use client';
import * as React from 'react';
import { styled, type Theme, SxProps } from '@mui/material';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Collapse from '@mui/material/Collapse';
import Divider from '@mui/material/Divider';
import Grow from '@mui/material/Grow';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import ListSubheader from '@mui/material/ListSubheader';
import Paper from '@mui/material/Paper';
import Tooltip from '@mui/material/Tooltip';
import type {} from '@mui/material/themeCssVarsAugmentation';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Link } from '../shared/Link';
import { NavigationContext } from '../shared/context';
import type { Navigation } from '../AppProvider';
import {
  getItemPath,
  getItemTitle,
  hasSelectedNavigationChildren,
  isPageItem,
} from '../shared/navigation';
import { getDrawerSxTransitionMixin } from './utils';
import { useActivePage } from '../useActivePage';

const NavigationListItemButton = styled(ListItemButton)(({ theme }) => ({
  borderRadius: 8,
  '&.Mui-selected': {
    '& .MuiListItemIcon-root': {
      color: (theme.vars ?? theme).palette.primary.dark,
    },
    '& .MuiTypography-root': {
      color: (theme.vars ?? theme).palette.text.primary,
    },
    '& .MuiSvgIcon-root': {
      color: (theme.vars ?? theme).palette.primary.dark,
    },
    '& .MuiAvatar-root': {
      backgroundColor: (theme.vars ?? theme).palette.primary.dark,
    },
    '& .MuiTouchRipple-child': {
      backgroundColor: (theme.vars ?? theme).palette.primary.dark,
    },
  },
  '& .MuiSvgIcon-root': {
    color: (theme.vars ?? theme).palette.action.active,
  },
  '& .MuiAvatar-root': {
    backgroundColor: (theme.vars ?? theme).palette.action.active,
  },
}));

interface DashboardSidebarSubNavigationProps {
  subNavigation: Navigation;
  depth?: number;
  onLinkClick: () => void;
  isMini?: boolean;
  isPopover?: boolean;
  isFullyExpanded?: boolean;
  isFullyCollapsed?: boolean;
  hasDrawerTransitions?: boolean;
}

/**
 * @ignore - internal component.
 */
function DashboardSidebarSubNavigation({
  subNavigation,
  depth = 0,
  onLinkClick,
  isMini = false,
  isPopover = false,
  isFullyExpanded = true,
  isFullyCollapsed = false,
  hasDrawerTransitions = false,
}: DashboardSidebarSubNavigationProps) {
  const navigationContext = React.useContext(NavigationContext);

  const activePage = useActivePage();

  const initialExpandedSidebarItemIds = React.useMemo(
    () =>
      subNavigation
        .map((navigationItem, navigationItemIndex) => ({
          navigationItem,
          originalIndex: navigationItemIndex,
        }))
        .filter(
          ({ navigationItem }) =>
            isPageItem(navigationItem) &&
            !!activePage &&
            hasSelectedNavigationChildren(navigationContext, navigationItem, activePage.path),
        )
        .map(({ originalIndex }) => `${depth}-${originalIndex}`),
    [activePage, depth, navigationContext, subNavigation],
  );

  const [expandedSidebarItemIds, setExpandedSidebarItemIds] = React.useState(
    initialExpandedSidebarItemIds,
  );
  const [hoveredMiniSidebarItemId, setHoveredMiniSidebarItemId] = React.useState<string | null>(
    null,
  );

  const handleOpenFolderClick = React.useCallback(
    (itemId: string) => () => {
      setExpandedSidebarItemIds((previousValue) =>
        previousValue.includes(itemId)
          ? previousValue.filter((previousValueItemId) => previousValueItemId !== itemId)
          : [...previousValue, itemId],
      );
    },
    [],
  );

  return (
    <List
      sx={{
        padding: 0,
        mt: isPopover && depth === 1 ? 0.5 : 0,
        mb: depth === 0 && !isPopover ? 4 : 0.5,
        pl: (isPopover ? 1 : 2) * (isPopover ? depth - 1 : depth),
        minWidth: isPopover && depth === 1 ? 240 : 'auto',
      }}
    >
      {subNavigation.map((navigationItem, navigationItemIndex) => {
        if (navigationItem.kind === 'header') {
          return (
            <ListSubheader
              key={`subheader-${depth}-${navigationItemIndex}`}
              component="div"
              sx={{
                fontSize: 12,
                fontWeight: '700',
                height: isMini ? 0 : 40,
                ...(hasDrawerTransitions
                  ? getDrawerSxTransitionMixin(isFullyExpanded, 'height')
                  : {}),
                px: 2,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                zIndex: 2,
              }}
            >
              {getItemTitle(navigationItem)}
            </ListSubheader>
          );
        }

        if (navigationItem.kind === 'divider') {
          const nextItem = subNavigation[navigationItemIndex + 1];

          return (
            <Divider
              key={`divider-${depth}-${navigationItemIndex}`}
              sx={{
                borderBottomWidth: 2,
                mx: 1,
                mt: 1,
                mb: nextItem?.kind === 'header' && !isMini ? 0 : 1,
                ...(hasDrawerTransitions
                  ? getDrawerSxTransitionMixin(isFullyExpanded, 'margin')
                  : {}),
              }}
            />
          );
        }

        const navigationItemFullPath = getItemPath(navigationContext, navigationItem);
        const navigationItemId = `${depth}-${navigationItemIndex}`;
        const navigationItemTitle = getItemTitle(navigationItem);

        const isNestedNavigationExpanded = expandedSidebarItemIds.includes(navigationItemId);

        const listItemIconSize = 34;

        const isActive =
          !!activePage && activePage.path === getItemPath(navigationContext, navigationItem);

        let nestedNavigationCollapseSx: SxProps<Theme> = { display: 'none' };
        if (isMini && isFullyCollapsed) {
          nestedNavigationCollapseSx = {
            fontSize: 18,
            position: 'absolute',
            top: '50%',
            right: '-1px',
            transform: 'translateY(-50%) rotate(-90deg)',
          };
        } else if (!isMini && isFullyExpanded) {
          nestedNavigationCollapseSx = {
            transform: `rotate(${isNestedNavigationExpanded ? 0 : -90}deg)`,
            transition: (theme: Theme) =>
              theme.transitions.create('transform', {
                easing: theme.transitions.easing.sharp,
                duration: 100,
              }),
          };
        }

        const listItem = (
          <ListItem
            {...(navigationItem.children && isMini
              ? {
                  onMouseEnter: () => {
                    setHoveredMiniSidebarItemId(navigationItemId);
                  },
                  onMouseLeave: () => {
                    setHoveredMiniSidebarItemId(null);
                  },
                }
              : {})}
            sx={{
              py: 0,
              px: 1,
              overflowX: 'hidden',
            }}
          >
            <NavigationListItemButton
              selected={
                activePage && navigationItem.children && isMini
                  ? hasSelectedNavigationChildren(
                      navigationContext,
                      navigationItem,
                      activePage.path,
                    )
                  : isActive && !navigationItem.children
              }
              sx={{
                px: 1.4,
                height: 48,
              }}
              {...(navigationItem.children && !isMini
                ? {
                    onClick: handleOpenFolderClick(navigationItemId),
                  }
                : {})}
              {...(!navigationItem.children
                ? {
                    LinkComponent: Link,
                    href: navigationItemFullPath,
                    onClick: onLinkClick,
                  }
                : {})}
            >
              {navigationItem.icon || isMini ? (
                <ListItemIcon
                  sx={{
                    minWidth: listItemIconSize,
                    mr: 1.2,
                  }}
                >
                  {navigationItem.icon ?? null}
                  {!navigationItem.icon && isMini ? (
                    <Avatar
                      sx={{
                        width: listItemIconSize - 7,
                        height: listItemIconSize - 7,
                        fontSize: 12,
                        ml: '-2px',
                      }}
                    >
                      {navigationItemTitle
                        .split(' ')
                        .slice(0, 2)
                        .map((itemTitleWord) => itemTitleWord.charAt(0).toUpperCase())}
                    </Avatar>
                  ) : null}
                </ListItemIcon>
              ) : null}
              <ListItemText
                primary={navigationItemTitle}
                sx={{
                  whiteSpace: 'nowrap',
                  zIndex: 1,
                }}
              />
              {navigationItem.action && !isMini && isFullyExpanded ? navigationItem.action : null}
              {navigationItem.children ? <ExpandMoreIcon sx={nestedNavigationCollapseSx} /> : null}
            </NavigationListItemButton>
            {navigationItem.children && isMini ? (
              <Grow in={navigationItemId === hoveredMiniSidebarItemId}>
                <Box
                  sx={{
                    position: 'fixed',
                    left: 62,
                    pl: '6px',
                  }}
                >
                  <Paper
                    sx={{
                      pt: 0.5,
                      pb: 0.5,
                      transform: (theme) => `translateY(calc(50% + ${theme.spacing(1)}))`,
                    }}
                  >
                    <DashboardSidebarSubNavigation
                      subNavigation={navigationItem.children}
                      depth={depth + 1}
                      onLinkClick={onLinkClick}
                      isPopover
                    />
                  </Paper>
                </Box>
              </Grow>
            ) : null}
          </ListItem>
        );

        return (
          <React.Fragment key={navigationItemId}>
            {isMini ? (
              <Tooltip
                title={navigationItemTitle}
                placement={navigationItem.children ? 'right-start' : 'right'}
              >
                {listItem}
              </Tooltip>
            ) : (
              listItem
            )}

            {navigationItem.children && !isMini ? (
              <Collapse in={isNestedNavigationExpanded} timeout="auto" unmountOnExit>
                <DashboardSidebarSubNavigation
                  subNavigation={navigationItem.children}
                  depth={depth + 1}
                  onLinkClick={onLinkClick}
                  isPopover={isPopover}
                />
              </Collapse>
            ) : null}
          </React.Fragment>
        );
      })}
    </List>
  );
}

export { DashboardSidebarSubNavigation };
