import { StyledComponent } from '@emotion/styled';
import { styled, BoxProps } from '@mui/material';

const Pre: StyledComponent<BoxProps> = styled('pre')({
  margin: 0,
  fontFamily: 'Consolas, Menlo, Monaco, "Andale Mono", "Ubuntu Mono", monospace',
});

export default Pre;
