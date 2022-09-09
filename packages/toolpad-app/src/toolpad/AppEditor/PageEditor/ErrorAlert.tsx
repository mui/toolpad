import * as React from 'react';
import { Alert, AlertTitle, IconButton, Collapse, Box } from '@mui/material';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Pre from '../../../components/Pre';

/**
 * Remove the error message from the stack trace
 */
function stackTraceOnly(stack: string, message: string): string {
  return stack.split(message)[1]?.trim() || '';
}

export interface ErrorAlertProps {
  error: unknown;
}

export default function ErrorAlert({ error }: ErrorAlertProps) {
  const message: string =
    typeof (error as any)?.message === 'string' ? (error as any).message : String(error);
  const stack: string | null =
    typeof (error as any)?.stack === 'string' ? (error as any).stack : null;

  const [expanded, setExpanded] = React.useState(false);
  const toggleExpanded = React.useCallback(() => setExpanded((actual) => !actual), []);

  return (
    <Alert severity="error" sx={{ position: 'relative' }}>
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
            <Pre>{stackTraceOnly(stack, message)}</Pre>
          </Box>
        </Collapse>
      ) : null}
    </Alert>
  );
}
