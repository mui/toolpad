import * as React from 'react';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import { styled, useTheme } from '@mui/material';
import { Link } from '../shared/Link';
import { ToolpadLogo } from './ToolpadLogo';
import { type Branding } from '../AppProvider';
import { useApplicationTitle } from '../shared/branding';

const LogoContainer = styled('div')({
  position: 'relative',
  height: 40,
  '& img': {
    maxHeight: 40,
  },
});

/**
 * @ignore - internal component.
 */
export function AppTitleComponent(props: Branding) {
  const theme = useTheme();
  const defaultTitle = useApplicationTitle();
  const title = props?.title ?? defaultTitle;
  return (
    <Link href={props?.homeUrl ?? '/'} style={{ color: 'red', textDecoration: 'none' }}>
      <Stack direction="row" alignItems="center">
        <LogoContainer>{props?.logo ?? <ToolpadLogo size={40} />}</LogoContainer>
        <Typography
          variant="h6"
          sx={{
            color: (theme.vars ?? theme).palette.primary.main,
            fontWeight: '700',
            ml: 1,
            whiteSpace: 'nowrap',
          }}
        >
          {title}
        </Typography>
      </Stack>
    </Link>
  );
}
