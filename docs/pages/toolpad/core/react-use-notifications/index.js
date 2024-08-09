import * as React from 'react';
import MarkdownDocs from 'docs/src/modules/components/MarkdownDocs';
import * as pageProps from 'docs-toolpad/data/toolpad/core/components/use-notifications/use-notifications.md?muiMarkdown';
import { NotificationsProvider } from '@toolpad/core/useNotifications';
import { createTheme, useTheme, ThemeProvider } from '@mui/material/styles';
import Snackbar from '@mui/material/Snackbar';

function DemoThemedSnackbar(props) {
  const outerTheme = useTheme();
  const paletteMode = outerTheme.palette.mode;
  const demoTheme = React.useMemo(
    () => createTheme({ palette: { mode: paletteMode } }),
    [paletteMode],
  );
  return (
    <ThemeProvider theme={demoTheme}>
      <Snackbar {...props} />
    </ThemeProvider>
  );
}

const notificationsProviderSlots = { snackbar: DemoThemedSnackbar };

export default function Page() {
  return (
    <NotificationsProvider slots={notificationsProviderSlots}>
      <MarkdownDocs disableAd {...pageProps} />
    </NotificationsProvider>
  );
}
