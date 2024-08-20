const indexPage = `import Link from 'next/link';
import * as React from 'react';
import Typography from '@mui/material/Typography';

export default function HomePage() {
  return (
    <Typography>
      Welcome to <Link href="https://mui.com/toolpad/core/introduction">Toolpad Core!</Link>
    </Typography>
  );
}
`;

export default indexPage;
