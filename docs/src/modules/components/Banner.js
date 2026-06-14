import * as React from 'react';
import Alert from '@mui/material/Alert';
import BrandingCssVarsProvider from 'docs/src/BrandingCssVarsProvider';

export default function Banner() {
  return (
    <BrandingCssVarsProvider>
      <Alert
        severity="warning"
        sx={{
          mb: 0,
          borderRadius: 0,
          '& .MuiAlert-message': {
            width: '100%',
          },
        }}
      >
        At the moment, the maintainers are primarily focused on other projects and are not actively
        working on Toolpad Core and Studio. You can use the CRUD dashboard template from the{' '}
        <a
          href="https://mui.com/material-ui/getting-started/templates/#free-templates"
          style={{ color: 'inherit', textDecoration: 'underline' }}
        >
          Material UI React templates page
        </a>{' '}
        as an easy-to-customize, copy-pastable alternative to the main Toolpad Core components —
        including dashboard layout and CRUD features. To share any feedback, please check{' '}
        <a
          href="https://github.com/mui/toolpad/discussions/5011"
          style={{ color: 'inherit', textDecoration: 'underline' }}
        >
          this GitHub discussion.
        </a>{' '}
      </Alert>
    </BrandingCssVarsProvider>
  );
}
