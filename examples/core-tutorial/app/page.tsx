import Link from 'next/link';
import { Button, Container, Typography, Box } from '@mui/material';

export default function Home() {
  return (
    <Container>
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Welcome to <Link href="https://mui.com/toolpad/core/introduction">Toolpad Core!</Link>
        </Typography>

        <Typography variant="body1">
          Get started by editing <code>(dashboard)/page/page.tsx</code>
        </Typography>

        <Box sx={{ mt: 2 }}>
          <Link href="/page">
            <Button variant="contained" color="primary">
              Go to Page
            </Button>
          </Link>
        </Box>
      </Box>
    </Container>
  );
}
