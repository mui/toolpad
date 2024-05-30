import { Typography, Container } from '@mui/material';

export default function Home() {
  return (
    <main>
      <Container sx={{ mx: 4 }}>
        <Typography variant="h6" color="grey.800">
          Dashboard content!
        </Typography>
      </Container>
    </main>
  );
}
