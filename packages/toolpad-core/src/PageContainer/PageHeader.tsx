'use client';
import * as React from 'react';
import PropTypes from 'prop-types';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import useSlotProps from '@mui/utils/useSlotProps';
import { styled } from '@mui/material';
import { Link as ToolpadLink } from '../shared/Link';
import { getItemTitle } from '../shared/navigation';
import { useActivePage } from '../useActivePage';
import { PageHeaderToolbar, PageHeaderToolbarProps } from './PageHeaderToolbar';
import type { Breadcrumb } from './PageContainer';

const PageContentHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-between',
  gap: theme.spacing(2),
}));

export interface PageHeaderSlotProps {
  toolbar: PageHeaderToolbarProps;
}

export interface PageHeaderSlots {
  /**
   * The component that renders the actions toolbar.
   * @default PageHeaderToolbar
   */
  toolbar: React.ElementType;
}

export interface PageHeaderProps {
  /**
   * The title of the page. Leave blank to use the active page title.
   */
  title?: string;
  /**
   * The breadcrumbs of the page. Leave blank to use the active page breadcrumbs.
   */
  breadcrumbs?: Breadcrumb[];
  /**
   * The components used for each slot inside.
   */
  slots?: PageHeaderSlots;
  /**
   * The props used for each slot inside.
   */
  slotProps?: PageHeaderSlotProps;
}

/**
 * A header component to provide a title and breadcrumbs for your pages.
 *
 * Demos:
 *
 * - [Page Container](https://mui.com/toolpad/core/react-page-container/)
 *
 * API:
 *
 * - [PageHeader API](https://mui.com/toolpad/core/api/page-header)
 */
function PageHeader(props: PageHeaderProps) {
  const { breadcrumbs, title } = props;

  const activePage = useActivePage();

  const resolvedBreadcrumbs = breadcrumbs ?? activePage?.breadcrumbs ?? [];
  const resolvedTitle = title ?? activePage?.title ?? '';

  const ToolbarComponent = props?.slots?.toolbar ?? PageHeaderToolbar;
  const toolbarSlotProps = useSlotProps({
    elementType: ToolbarComponent,
    ownerState: props,
    externalSlotProps: props?.slotProps?.toolbar,
    additionalProps: {},
  });

  return (
    <Stack>
      <Breadcrumbs aria-label="breadcrumb">
        {resolvedBreadcrumbs
          ? resolvedBreadcrumbs.map((item, index) => {
              return item.path ? (
                <Link
                  key={index}
                  component={ToolpadLink}
                  underline="hover"
                  color="inherit"
                  href={item.path}
                >
                  {getItemTitle(item)}
                </Link>
              ) : (
                <Typography key={index} color="text.primary">
                  {getItemTitle(item)}
                </Typography>
              );
            })
          : null}
      </Breadcrumbs>

      <PageContentHeader>
        {resolvedTitle ? <Typography variant="h4">{resolvedTitle}</Typography> : null}
        <ToolbarComponent {...toolbarSlotProps} />
      </PageContentHeader>
    </Stack>
  );
}

PageHeader.propTypes /* remove-proptypes */ = {
  // ┌────────────────────────────── Warning ──────────────────────────────┐
  // │ These PropTypes are generated from the TypeScript type definitions. │
  // │ To update them, edit the TypeScript types and run `pnpm proptypes`. │
  // └─────────────────────────────────────────────────────────────────────┘
  /**
   * The breadcrumbs of the page. Leave blank to use the active page breadcrumbs.
   */
  breadcrumbs: PropTypes.arrayOf(
    PropTypes.shape({
      path: PropTypes.string,
      title: PropTypes.string.isRequired,
    }),
  ),
  /**
   * The props used for each slot inside.
   */
  slotProps: PropTypes.shape({
    toolbar: PropTypes.shape({
      children: PropTypes.node,
    }).isRequired,
  }),
  /**
   * The components used for each slot inside.
   */
  slots: PropTypes.shape({
    toolbar: PropTypes.elementType,
  }),
  /**
   * The title of the page. Leave blank to use the active page title.
   */
  title: PropTypes.string,
} as any;

export { PageHeader };
