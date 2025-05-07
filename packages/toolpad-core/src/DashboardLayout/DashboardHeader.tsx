import * as React from 'react';
import PropTypes from 'prop-types';
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import MuiAppBar from '@mui/material/AppBar';
import IconButton from '@mui/material/IconButton';
import Toolbar from '@mui/material/Toolbar';
import Tooltip from '@mui/material/Tooltip';
import MenuIcon from '@mui/icons-material/Menu';
import MenuOpenIcon from '@mui/icons-material/MenuOpen';
import Stack from '@mui/material/Stack';
import { BrandingContext } from '../shared/context';
import type { Branding } from '../AppProvider';
import type { AccountProps } from '../Account';
import { AppTitle, type AppTitleProps } from './AppTitle';
import { ToolbarActions } from './ToolbarActions';

const AppBar = styled(MuiAppBar)(({ theme }) => ({
  borderWidth: 0,
  borderBottomWidth: 1,
  borderStyle: 'solid',
  borderColor: (theme.vars ?? theme).palette.divider,
  boxShadow: 'none',
  zIndex: theme.zIndex.drawer + 1,
}));

export interface DashboardHeaderSlotProps {
  appTitle?: AppTitleProps;
  toolbarActions?: {};
  toolbarAccount?: AccountProps;
}

export interface DashboardHeaderSlots {
  /**
   * The component used for the app title section.
   * @default Link
   * @see [DashboardLayout#slots](https://mui.com/toolpad/core/react-dashboard-layout/#slots)
   */
  appTitle?: React.ElementType;
  /**
   * The toolbar actions component to be used.
   * @default ToolbarActions
   * @see [DashboardLayout#slots](https://mui.com/toolpad/core/react-dashboard-layout/#slots)
   */
  toolbarActions?: React.JSXElementConstructor<{}>;
  /**
   * The toolbar account component to be used.
   * @default Account
   * @deprecated Place your custom component on the right in the `toolbarActions` slot instead.
   * @see [DashboardLayout#slots](https://mui.com/toolpad/core/react-dashboard-layout/#slots)
   */
  toolbarAccount?: React.JSXElementConstructor<AccountProps>;
}

export interface DashboardHeaderProps {
  /**
   * Branding options for the header.
   * @default null
   */
  branding?: Branding | null;
  /**
   * If `true`, show menu button as if menu is expanded, otherwise show it as if menu is collapsed.
   */
  menuOpen: boolean;
  /**
   * Callback fired when the menu button is clicked.
   */
  onToggleMenu: (open: boolean) => void;
  /**
   * Whether the menu icon should always be hidden.
   * @default false
   */
  hideMenuButton?: boolean;
  /**
   * The components used for each slot inside.
   * @default {}
   */
  slots?: DashboardHeaderSlots;
  /**
   * The props used for each slot inside.
   * @default {}
   */
  slotProps?: DashboardHeaderSlotProps;
}
/**
 *
 * Demos:
 *
 * - [Dashboard Layout](https://mui.com/toolpad/core/react-dashboard-layout/)
 *
 * API:
 *
 * - [DashboardHeader API](https://mui.com/toolpad/core/api/dashboard-header)
 */
function DashboardHeader(props: DashboardHeaderProps) {
  const {
    branding: brandingProp,
    menuOpen,
    onToggleMenu,
    hideMenuButton,
    slots,
    slotProps,
  } = props;

  const brandingContext = React.useContext(BrandingContext);

  const branding = { ...brandingContext, ...brandingProp };

  const handleMenuOpen = React.useCallback(() => {
    onToggleMenu(!menuOpen);
  }, [menuOpen, onToggleMenu]);

  const getMenuIcon = React.useCallback(
    (isExpanded: boolean) => {
      const expandMenuActionText = 'Expand';
      const collapseMenuActionText = 'Collapse';

      return (
        <Tooltip
          title={`${isExpanded ? collapseMenuActionText : expandMenuActionText} menu`}
          enterDelay={1000}
        >
          <div>
            <IconButton
              aria-label={`${isExpanded ? collapseMenuActionText : expandMenuActionText} navigation menu`}
              onClick={handleMenuOpen}
            >
              {isExpanded ? <MenuOpenIcon /> : <MenuIcon />}
            </IconButton>
          </div>
        </Tooltip>
      );
    },
    [handleMenuOpen],
  );

  const ToolbarActionsSlot = slots?.toolbarActions ?? ToolbarActions;
  const ToolbarAccountSlot = slots?.toolbarAccount ?? (() => null);

  return (
    <AppBar color="inherit" position="absolute" sx={{ displayPrint: 'none' }}>
      <Toolbar sx={{ backgroundColor: 'inherit', mx: { xs: -0.75, sm: -1 } }}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{
            flexWrap: 'wrap',
            width: '100%',
          }}
        >
          <Stack direction="row">
            <Box
              sx={{
                display: { xs: hideMenuButton ? 'none' : 'block', md: 'none' },
                mr: { sm: 1 },
              }}
            >
              {getMenuIcon(menuOpen)}
            </Box>
            <Box
              sx={{
                display: { xs: 'none', md: hideMenuButton ? 'none' : 'block' },
                mr: 1,
              }}
            >
              {getMenuIcon(menuOpen)}
            </Box>
            {slots?.appTitle ? (
              <slots.appTitle {...slotProps?.appTitle} />
            ) : (
              /* Hierarchy of application of `branding`
               * 1. Branding prop passed in the `slotProps.appTitle`
               * 2. Branding prop passed to the `DashboardLayout`
               * 3. Branding prop passed to the `AppProvider`
               */
              <AppTitle branding={branding} {...slotProps?.appTitle} />
            )}
          </Stack>
          <Stack direction="row" alignItems="center" spacing={1} sx={{ marginLeft: 'auto' }}>
            <ToolbarActionsSlot {...slotProps?.toolbarActions} />
            <ToolbarAccountSlot {...slotProps?.toolbarAccount} />
          </Stack>
        </Stack>
      </Toolbar>
    </AppBar>
  );
}

DashboardHeader.propTypes /* remove-proptypes */ = {
  // ┌────────────────────────────── Warning ──────────────────────────────┐
  // │ These PropTypes are generated from the TypeScript type definitions. │
  // │ To update them, edit the TypeScript types and run `pnpm proptypes`. │
  // └─────────────────────────────────────────────────────────────────────┘
  /**
   * Branding options for the header.
   * @default null
   */
  branding: PropTypes.shape({
    homeUrl: PropTypes.string,
    logo: PropTypes.node,
    title: PropTypes.string,
  }),
  /**
   * Whether the menu icon should always be hidden.
   * @default false
   */
  hideMenuButton: PropTypes.bool,
  /**
   * If `true`, show menu button as if menu is expanded, otherwise show it as if menu is collapsed.
   */
  menuOpen: PropTypes.bool.isRequired,
  /**
   * Callback fired when the menu button is clicked.
   */
  onToggleMenu: PropTypes.func.isRequired,
  /**
   * The props used for each slot inside.
   * @default {}
   */
  slotProps: PropTypes.shape({
    appTitle: PropTypes.shape({
      branding: PropTypes.shape({
        homeUrl: PropTypes.string,
        logo: PropTypes.node,
        title: PropTypes.string,
      }),
    }),
    toolbarAccount: PropTypes.shape({
      localeText: PropTypes.object,
      slotProps: PropTypes.shape({
        popover: PropTypes.object,
        popoverContent: PropTypes.object,
        preview: PropTypes.object,
        signInButton: PropTypes.object,
        signOutButton: PropTypes.object,
      }),
      slots: PropTypes.shape({
        popover: PropTypes.elementType,
        popoverContent: PropTypes.elementType,
        preview: PropTypes.elementType,
        signInButton: PropTypes.elementType,
        signOutButton: PropTypes.elementType,
      }),
    }),
    toolbarActions: PropTypes.object,
  }),
  /**
   * The components used for each slot inside.
   * @default {}
   */
  slots: PropTypes.shape({
    appTitle: PropTypes.elementType,
    toolbarAccount: PropTypes.elementType,
    toolbarActions: PropTypes.elementType,
  }),
} as any;

export { DashboardHeader };
