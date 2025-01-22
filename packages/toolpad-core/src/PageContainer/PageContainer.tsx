'use client';
import * as React from 'react';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import Container, { ContainerProps } from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import { SxProps } from '@mui/material';
import { PageHeader, PageHeaderProps } from './PageHeader';

export interface Breadcrumb {
  /**
   * The title of the breadcrumb segment.
   */
  title: string;
  /**
   * The path the breadcrumb links to.
   */
  path?: string;
}
export interface PageContainerSlotProps {
  header: PageHeaderProps;
}

export interface PageContainerSlots {
  /**
   * The component that renders the page header.
   * @default PageHeader
   */
  header: React.ElementType;
}

export interface PageContainerProps extends ContainerProps {
  children?: React.ReactNode;
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
  slots?: PageContainerSlots;
  /**
   * The props used for each slot inside.
   */
  slotProps?: PageContainerSlotProps;
  /**
   * The system prop that allows defining system overrides as well as additional CSS styles.
   */
  sx?: SxProps;
}

/**
 * A container component to provide a title and breadcrumbs for your pages.
 *
 * Demos:
 *
 * - [Page Container](https://mui.com/toolpad/core/react-page-container/)
 *
 * API:
 *
 * - [PageContainer API](https://mui.com/toolpad/core/api/page-container)
 */
function PageContainer(props: PageContainerProps) {
  const { children, breadcrumbs, slots, slotProps, title, ...rest } = props;

  const PageHeaderSlot = slots?.header ?? PageHeader;

  return (
    <Container {...rest} sx={{ flex: 1, display: 'flex', flexDirection: 'column', ...rest.sx }}>
      <Stack sx={{ flex: 1, my: 2 }} spacing={2}>
        <PageHeaderSlot title={title} breadcrumbs={breadcrumbs} {...slotProps?.header} />
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>{children}</Box>
      </Stack>
    </Container>
  );
}

PageContainer.propTypes /* remove-proptypes */ = {
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
   * @ignore
   */
  children: PropTypes.node,
  /**
   * The props used for each slot inside.
   */
  slotProps: PropTypes.shape({
    header: PropTypes.shape({
      breadcrumbs: PropTypes.arrayOf(
        PropTypes.shape({
          path: PropTypes.string,
          title: PropTypes.string.isRequired,
        }),
      ),
      slotProps: PropTypes.shape({
        toolbar: PropTypes.object.isRequired,
      }),
      slots: PropTypes.shape({
        toolbar: PropTypes.elementType,
      }),
      title: PropTypes.string,
    }).isRequired,
  }),
  /**
   * The components used for each slot inside.
   */
  slots: PropTypes.shape({
    header: PropTypes.elementType,
  }),
  /**
   * The system prop that allows defining system overrides as well as additional CSS styles.
   */
  sx: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.func, PropTypes.object, PropTypes.bool])),
    PropTypes.func,
    PropTypes.object,
  ]),
  /**
   * The title of the page. Leave blank to use the active page title.
   */
  title: PropTypes.string,
} as any;

export { PageContainer };
