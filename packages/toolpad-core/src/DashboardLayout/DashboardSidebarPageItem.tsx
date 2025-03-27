'use client';
import * as React from 'react';
import PropTypes from 'prop-types';
import { styled, type Theme, SxProps } from '@mui/material';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Collapse from '@mui/material/Collapse';
import Grow from '@mui/material/Grow';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import type {} from '@mui/material/themeCssVarsAugmentation';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Link } from '../shared/Link';
import { MINI_DRAWER_WIDTH } from './shared';
import type { Navigation, NavigationPageItem } from '../AppProvider';

const NavigationListItemButton = styled(ListItemButton)(({ theme }) => ({
  borderRadius: 8,
  '&.Mui-selected': {
    '& .MuiListItemIcon-root': {
      color: (theme.vars ?? theme).palette.primary.dark,
    },
    '& .MuiTypography-root': {
      color: (theme.vars ?? theme).palette.primary.dark,
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

export interface DashboardSidebarPageItemProps {
  /**
   * A string that uniquely identifies the item.
   */
  id: string;
  /**
   * Navigation item definition.
   */
  item: NavigationPageItem;
  /**
   * Callback fired when the item is clicked.
   */
  onClick: (itemId: string, item: NavigationPageItem) => void;
  /**
   * Item title.
   */
  title: string;
  /**
   * Link `href` for when the item is rendered as a link.
   */
  href: string;
  /**
   * The component used to render the item as a link.
   * @default Link
   */
  Link?: React.ElementType;
  /**
   * If `true`, expands any nested navigation in the item, otherwise collapse it.
   * @default false
   */
  expanded?: boolean;
  /**
   * If `true`, the containing sidebar is in mini mode.
   * @default false
   */
  mini?: boolean;
  /**
   * Use to apply selected styling.
   * @default false
   */
  selected?: boolean;
  /**
   * If `true`, the item is disabled.
   * @default false
   */
  disabled?: boolean;
  /**
   * If `true`, the containing sidebar is fully expanded.
   * @default true
   */
  isSidebarFullyExpanded?: boolean;
  /**
   * If `true`, the containing sidebar is fully collapsed.
   * @default false
   */
  isSidebarFullyCollapsed?: boolean;
  /**
   * Override the component rendered as nested navigation for this item.
   */
  renderNestedNavigation: (subNavigation: Navigation) => React.ReactNode;
}

const LIST_ITEM_ICON_SIZE = 34;
/**
 *
 * Demos:
 *
 * - [Dashboard Layout](https://mui.com/toolpad/core/react-dashboard-layout/)
 *
 * API:
 *
 * - [DashboardSidebarPageItem API](https://mui.com/toolpad/core/api/dashboard-sidebar-page-item)
 */
function DashboardSidebarPageItem({
  id,
  item,
  onClick,
  title,
  href,
  Link: LinkProp = Link,
  expanded = false,
  mini = false,
  selected = false,
  disabled = false,
  isSidebarFullyExpanded = true,
  isSidebarFullyCollapsed = false,
  renderNestedNavigation,
}: DashboardSidebarPageItemProps) {
  const [hoveredMiniSidebarItemId, setHoveredMiniSidebarItemId] = React.useState<string | null>(
    null,
  );

  const handleClick = React.useCallback(() => {
    onClick(id, item);
  }, [id, item, onClick]);

  let nestedNavigationCollapseSx: SxProps<Theme> = { display: 'none' };
  if (mini && isSidebarFullyCollapsed) {
    nestedNavigationCollapseSx = {
      fontSize: 18,
      position: 'absolute',
      top: '41.5%',
      right: '2px',
      transform: 'translateY(-50%) rotate(-90deg)',
    };
  } else if (!mini && isSidebarFullyExpanded) {
    nestedNavigationCollapseSx = {
      ml: 0.5,
      transform: `rotate(${expanded ? 0 : -90}deg)`,
      transition: (theme: Theme) =>
        theme.transitions.create('transform', {
          easing: theme.transitions.easing.sharp,
          duration: 100,
        }),
    };
  }

  const listItem = (
    <ListItem
      {...(item.children && mini
        ? {
            onMouseEnter: () => {
              setHoveredMiniSidebarItemId(id);
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
        selected={selected}
        disabled={disabled}
        sx={{
          px: 1.4,
          height: mini ? 60 : 48,
        }}
        {...(item.children && !mini
          ? {
              onClick: handleClick,
            }
          : {})}
        {...(!item.children
          ? {
              LinkComponent: LinkProp,
              href,
              onClick: handleClick,
            }
          : {})}
      >
        {item.icon || mini ? (
          <Box
            sx={{
              position: 'relative',
              top: mini ? -6 : 0,
              left: mini ? 5 : 0,
            }}
          >
            <ListItemIcon
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minWidth: LIST_ITEM_ICON_SIZE,
              }}
            >
              {item.icon ?? null}
              {!item.icon && mini ? (
                <Avatar
                  sx={{
                    width: LIST_ITEM_ICON_SIZE - 7,
                    height: LIST_ITEM_ICON_SIZE - 7,
                    fontSize: 12,
                    ml: '-2px',
                  }}
                >
                  {title
                    .split(' ')
                    .slice(0, 2)
                    .map((titleWord) => titleWord.charAt(0).toUpperCase())}
                </Avatar>
              ) : null}
            </ListItemIcon>
            {mini ? (
              <Typography
                variant="caption"
                sx={{
                  position: 'absolute',
                  bottom: -18,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  fontSize: 10,
                  fontWeight: 500,
                  textAlign: 'center',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  width: MINI_DRAWER_WIDTH - 28,
                }}
              >
                {title}
              </Typography>
            ) : null}
          </Box>
        ) : null}
        {!mini ? (
          <ListItemText
            primary={title}
            sx={{
              ml: 1.2,
              whiteSpace: 'nowrap',
              zIndex: 1,
            }}
          />
        ) : null}
        {item.action && !mini && isSidebarFullyExpanded ? item.action : null}
        {item.children ? <ExpandMoreIcon sx={nestedNavigationCollapseSx} /> : null}
      </NavigationListItemButton>
      {item.children && mini ? (
        <Grow in={id === hoveredMiniSidebarItemId}>
          <Box
            sx={{
              position: 'fixed',
              left: MINI_DRAWER_WIDTH - 2,
              pl: '6px',
            }}
          >
            <Paper
              sx={{
                pt: 0.5,
                pb: 0.5,
                transform: 'translateY(calc(50% - 30px))',
              }}
            >
              {renderNestedNavigation(item.children)}
            </Paper>
          </Box>
        </Grow>
      ) : null}
    </ListItem>
  );

  return (
    <React.Fragment key={id}>
      {listItem}
      {item.children && !mini ? (
        <Collapse in={expanded} timeout="auto" unmountOnExit>
          {renderNestedNavigation(item.children)}
        </Collapse>
      ) : null}
    </React.Fragment>
  );
}

DashboardSidebarPageItem.propTypes /* remove-proptypes */ = {
  // ┌────────────────────────────── Warning ──────────────────────────────┐
  // │ These PropTypes are generated from the TypeScript type definitions. │
  // │ To update them, edit the TypeScript types and run `pnpm proptypes`. │
  // └─────────────────────────────────────────────────────────────────────┘
  /**
   * If `true`, the item is disabled.
   * @default false
   */
  disabled: PropTypes.bool,
  /**
   * If `true`, expands any nested navigation in the item, otherwise collapse it.
   * @default false
   */
  expanded: PropTypes.bool,
  /**
   * Link `href` for when the item is rendered as a link.
   */
  href: PropTypes.string.isRequired,
  /**
   * A string that uniquely identifies the item.
   */
  id: PropTypes.string.isRequired,
  /**
   * If `true`, the containing sidebar is fully collapsed.
   * @default false
   */
  isSidebarFullyCollapsed: PropTypes.bool,
  /**
   * If `true`, the containing sidebar is fully expanded.
   * @default true
   */
  isSidebarFullyExpanded: PropTypes.bool,
  /**
   * Navigation item definition.
   */
  item: PropTypes.shape({
    action: PropTypes.node,
    children: PropTypes.arrayOf(
      PropTypes.oneOfType([
        PropTypes.object,
        PropTypes.shape({
          kind: PropTypes.oneOf(['header']).isRequired,
          title: PropTypes.string.isRequired,
        }),
        PropTypes.shape({
          kind: PropTypes.oneOf(['divider']).isRequired,
        }),
      ]).isRequired,
    ),
    icon: PropTypes.node,
    kind: PropTypes.oneOf(['page']),
    pattern: PropTypes.string,
    renderItem: PropTypes.func,
    segment: PropTypes.string,
    title: PropTypes.string,
  }).isRequired,
  /**
   * The component used to render the item as a link.
   * @default Link
   */
  Link: PropTypes.elementType,
  /**
   * If `true`, the containing sidebar is in mini mode.
   * @default false
   */
  mini: PropTypes.bool,
  /**
   * Callback fired when the item is clicked.
   */
  onClick: PropTypes.func.isRequired,
  /**
   * Override the component rendered as nested navigation for this item.
   */
  renderNestedNavigation: PropTypes.func.isRequired,
  /**
   * Use to apply selected styling.
   * @default false
   */
  selected: PropTypes.bool,
  /**
   * Item title.
   */
  title: PropTypes.string.isRequired,
} as any;

export { DashboardSidebarPageItem };
