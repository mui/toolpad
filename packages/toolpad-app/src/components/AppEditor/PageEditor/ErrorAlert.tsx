import * as React from 'react';
import { Alert, AlertTitle, IconButton, Collapse, Box } from '@mui/material';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

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
    <Alert
      severity="error"
      sx={{
        // The content of the Alert doesn't overflow nicely
        // TODO: does this need to go in core?
        '& .MuiAlert-message': { minWidth: 0 },
      }}
      action={
        stack ? (
          <IconButton color="inherit" onClick={toggleExpanded}>
            {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
        ) : null
      }
    >
      <AlertTitle>{message}</AlertTitle>
      <Collapse in={expanded}>
        <Box sx={{ overflow: 'auto' }}>
          <pre>{stack}</pre>
        </Box>
      </Collapse>
    </Alert>
  );
}
