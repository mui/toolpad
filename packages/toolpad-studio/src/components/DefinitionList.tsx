import { styled } from '@mui/material';

export default styled('dl')(({ theme }) => ({
  ...theme.typography.body1,
  display: 'grid',
  gridTemplateColumns: 'fit-content(50%) 1fr',
  '& > dt': {
    fontWeight: theme.typography.fontWeightBold,
    textAlign: 'right',
  },
  '& > dd': {
    marginLeft: theme.spacing(1),
  },
}));
