import * as React from 'react';
import { Alert, AlertTitle, IconButton, Collapse, Box, SxProps } from '@mui/material';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { indent } from '@toolpad/utils/strings';
import Pre from '../../../components/Pre';

export interface ErrorAlertProps {
  error: unknown;
  sx?: SxProps;
}

function formatStack(maybeError: unknown): string | null {
  if (!maybeError) {
    return null;
  }
  let causeStack: string | null | undefined;
  if ((maybeError as any)?.cause) {
    causeStack = formatStack((maybeError as any).cause);
    if (causeStack) {
      causeStack = `cause:\n${indent(causeStack, 2)}`;
    }
  }
  let thisStack: string | undefined;
  if (typeof (maybeError as any)?.stack === 'string') {
    thisStack = (maybeError as any).stack;
  }
  return thisStack || causeStack ? [thisStack, causeStack].filter(Boolean).join('\n') : null;
}

export default function ErrorAlert({ error, sx }: ErrorAlertProps) {
  const message: string =
    typeof (error as any)?.message === 'string' ? (error as any).message : String(error);
  const stack: string | null = formatStack(error);

  const [expanded, setExpanded] = React.useState(false);
  const toggleExpanded = React.useCallback(() => setExpanded((actual) => !actual), []);

  return (
    <Alert severity="error" sx={{ ...sx, position: 'relative' }}>
      {stack ? (
        <IconButton
          color="inherit"
          onClick={toggleExpanded}
          sx={{
            position: 'absolute',
            top: 10,
            right: 8,
          }}
        >
          {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </IconButton>
      ) : null}
      <AlertTitle>
        <Pre sx={{ whiteSpace: 'pre-wrap' }}>{message}</Pre>
      </AlertTitle>
      {stack ? (
        <Collapse in={expanded}>
          <Box sx={{ overflow: 'auto' }}>
            <Pre>{stack}</Pre>
          </Box>
        </Collapse>
      ) : null}
    </Alert>
  );
}
