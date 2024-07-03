'use client';
import * as React from 'react';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Container, { ContainerProps } from '@mui/material/Container';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { useSlotProps } from '@mui/base/utils';
import { RouterContext } from '../AppProvider';
import { Link as ToolpadLink } from '../shared/Link';
import { PageContentToolbar, PageContentToolbarProps } from './PageContentToolbar';
import {
  isPageItem,
  Navigation,
  NavigationContext,
  NavigationItem,
  NavigationPageItem,
} from '../contexts/NavigationContext';

const isRootPage = (item: NavigationItem) => isPageItem(item) && !item.slug;

interface BreadCrumbItem extends NavigationPageItem {
  path: string;
}

function createPageLookup(
  navigation: Navigation,
  segments: BreadCrumbItem[] = [],
  base = '',
): Map<string, BreadCrumbItem[]> {
  const result = new Map<string, BreadCrumbItem[]>();

  const resolveSlug = (slug: string) => `${base}${slug ? `/${slug}` : ''}` || '/';

  const root = navigation.find((item) => isRootPage(item)) as NavigationPageItem | undefined;
  const rootCrumb = root ? { path: resolveSlug(''), ...root } : undefined;

  for (const item of navigation) {
    if (!isPageItem(item)) {
      continue;
    }

    const path = resolveSlug(item.slug);
    if (result.has(path)) {
      throw new Error(`Duplicate path in navigation: ${path}`);
    }

    const itemCrumb: BreadCrumbItem = { path, ...item };

    const navigationSegments: BreadCrumbItem[] = [
      ...segments,
      ...(rootCrumb && !isRootPage(item) ? [rootCrumb] : []),
      itemCrumb,
    ];

    result.set(path, navigationSegments);

    if (item.children) {
      const childrenLookup = createPageLookup(item.children, navigationSegments, path);
      for (const [childPath, childItems] of childrenLookup) {
        if (result.has(childPath)) {
          throw new Error(`Duplicate path in navigation: ${childPath}`);
        }
        result.set(childPath, [itemCrumb, ...childItems]);
      }
    }
  }

  return result;
}

function matchPath(navigation: Navigation, path: string): BreadCrumbItem[] | null {
  const lookup = createPageLookup(navigation);
  return lookup.get(path) ?? null;
}

export interface PageContentSlotProps {
  toolbar: PageContentToolbarProps;
}

export interface PageContentSlots {
  /**
   * The component that renders the actions toolbar.
   * @default Snackbar
   */
  toolbar: React.ElementType;
}

export interface PageContentProps extends ContainerProps {
  children?: React.ReactNode;
  title?: string;
  slots?: PageContentSlots;
  slotProps?: PageContentSlotProps;
}
/**
 *
 * Demos:
 *
 * - [Page Content](https://mui.com/toolpad/core/react-page-content/)
 *
 * API:
 *
 * - [PageContent API](https://mui.com/toolpad/core/api/page-content)
 */
function PageContent(props: PageContentProps) {
  const { children, slots, slotProps, ...rest } = props;
  const routerContext = React.useContext(RouterContext);
  const navigationContext = React.useContext(NavigationContext);
  const pathname = routerContext?.pathname ?? '/';
  const breadCrumbs = React.useMemo(
    () => matchPath(navigationContext, pathname),
    [navigationContext, pathname],
  );

  const title = (breadCrumbs ? breadCrumbs[breadCrumbs.length - 1].title : '') ?? props.title;

  const ToolbarComponent = props?.slots?.toolbar ?? PageContentToolbar;
  const toolbarSlotProps = useSlotProps({
    elementType: ToolbarComponent,
    ownerState: props,
    externalSlotProps: props?.slotProps?.toolbar,
    additionalProps: {},
  });

  return (
    <Container {...rest}>
      <Stack sx={{ my: 2 }} spacing={2}>
        <Stack>
          <Breadcrumbs aria-label="breadcrumb">
            {breadCrumbs
              ? breadCrumbs.map((item, index) => {
                  return index < breadCrumbs.length - 1 ? (
                    <Link
                      key={item.path}
                      component={ToolpadLink}
                      underline="hover"
                      color="inherit"
                      href={item.path}
                    >
                      {item.title}
                    </Link>
                  ) : (
                    <Typography key={item.path} color="text.primary">
                      {item.title}
                    </Typography>
                  );
                })
              : null}
          </Breadcrumbs>

          <Toolbar disableGutters>
            {title ? <Typography variant="h4">{title}</Typography> : null}
            <Box sx={{ flex: 1 }} />
            <ToolbarComponent {...toolbarSlotProps} />
          </Toolbar>
        </Stack>
        <div>{children}</div>
      </Stack>
    </Container>
  );
}

PageContent.propTypes /* remove-proptypes */ = {
  // ┌────────────────────────────── Warning ──────────────────────────────┐
  // │ These PropTypes are generated from the TypeScript type definitions. │
  // │ To update them, edit the TypeScript types and run `pnpm proptypes`. │
  // └─────────────────────────────────────────────────────────────────────┘
  /**
   * @ignore
   */
  children: PropTypes.node,
  /**
   * @ignore
   */
  slotProps: PropTypes.shape({
    toolbar: PropTypes.shape({
      children: PropTypes.node,
    }).isRequired,
  }),
  /**
   * @ignore
   */
  slots: PropTypes.shape({
    toolbar: PropTypes.elementType,
  }),
  /**
   * @ignore
   */
  title: PropTypes.string,
} as any;

export { PageContent };
