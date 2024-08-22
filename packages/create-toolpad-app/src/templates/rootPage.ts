const rootPage = `
  "use client";
  import Link from 'next/link';
  import Container from '@mui/material/Container';
  import Typography from '@mui/material/Typography';
  import Box from '@mui/material/Box';
  import NavigateButton from './NavigateButton';
  
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
          <NavigateButton />
        </Box>
      </Container>
    );
  }  
  `;

export default rootPage;
