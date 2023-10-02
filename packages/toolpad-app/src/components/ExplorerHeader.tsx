import * as React from 'react';
import { IconButton, Tooltip, Stack, useTheme, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

interface ExplorerHeaderProps {
  headerText: string;
  createLabelText?: string;
  onCreate?: React.MouseEventHandler<HTMLButtonElement>;
}

export default function ExplorerHeader({
  headerText,
  onCreate,
  createLabelText,
}: ExplorerHeaderProps) {
  const theme = useTheme();

  return (
    <Stack
      direction="row"
      alignItems="center"
      justifyContent="space-between"
      sx={{
        backgroundColor: theme.palette.background.paper,
        position: 'sticky',
        pl: 1,
        top: 0,
        left: 0,
        width: '100%',
        zIndex: 1,
        height: 36,
      }}
    >
      <Typography
        variant="body2"
        sx={{
          flexGrow: 1,
          fontWeight: theme.typography.fontWeightLight,
          mx: 1,
          my: 0.5,
        }}
      >
        {headerText}
      </Typography>
      {onCreate && createLabelText ? (
        <Tooltip title={createLabelText}>
          <IconButton aria-label={createLabelText} size="medium" onClick={onCreate}>
            <AddIcon />
          </IconButton>
        </Tooltip>
      ) : null}
    </Stack>
  );
}
