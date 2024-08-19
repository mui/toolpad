const indexPage = `import Link from 'next/link';
import * as React from 'react';
import Typography from '@mui/material/Typography';

export default function HomePage() {
  return (
    <div>
        <Typography variant="h4" component="h1" sx={{m: 2}}>
            Welcome to <Link href="https://mui.com/toolpad/core/introduction">Toolpad Core!</Link>
        </Typography>
    </div>
  );
}
`;

export default indexPage;
