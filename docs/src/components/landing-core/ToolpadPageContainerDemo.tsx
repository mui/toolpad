import * as React from 'react';
import Frame from 'docs/src/components/action/Frame';
import Paper from '@mui/material/Paper';
import { HighlightedCode } from '@mui/docs/HighlightedCode';
import { AppProvider } from '@toolpad/core/AppProvider';
import { PageContainer } from '@toolpad/core/PageContainer';
import { useDemoRouter } from '@toolpad/core/internals/demo';

const code = `
<PageContainer>
  Page content
</PageContainer>
`;

const NAVIGATION = [
  { segment: '', title: 'Home' },
  { segment: 'orders', title: 'Orders' },
];

function PageContainerDemp() {
  const router = useDemoRouter('/orders');
  return (
    <AppProvider navigation={NAVIGATION} router={router}>
      <Paper sx={{ width: '100%', height: { sm: 200, md: 400 } }}>
        <PageContainer>Page content</PageContainer>
      </Paper>
    </AppProvider>
  );
}

export default function ToolpadPageContainerDemo() {
  return (
    <Frame sx={{ height: '100%' }}>
      <Frame.Demo sx={{ p: 2 }}>
        <Paper
          variant="outlined"
          sx={(theme) => ({
            p: 2,
            display: 'flex',
            alignItems: 'center',
            maxWidth: '100%',
            mx: 'auto',
            bgcolor: '#FFF',
            borderRadius: '8px',
            ...theme.applyDarkStyles({
              bgcolor: 'primaryDark.900',
            }),
          })}
        >
          <PageContainerDemp />
        </Paper>
      </Frame.Demo>
      <Frame.Info data-mui-color-scheme="dark" sx={{ maxHeight: 600, overflow: 'auto' }}>
        <HighlightedCode copyButtonHidden plainStyle code={code} language="jsx" />
      </Frame.Info>
    </Frame>
  );
}
