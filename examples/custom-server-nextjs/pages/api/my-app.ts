import { createHandler } from '@mui/toolpad';

export default createHandler({
  dev: process.env.NODE_ENV === 'development',
  base: '/api/my-app',
});
