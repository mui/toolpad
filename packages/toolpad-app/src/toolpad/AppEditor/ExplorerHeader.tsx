import * as React from 'react';
import { IconButton, Tooltip, Stack, Typography, styled } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

interface ExplorerHeaderProps {
  headerText: string;
  headerIcon?: React.ReactNode;
  createLabelText?: string;
  onCreate?: React.MouseEventHandler<HTMLButtonElement>;
}

const ExplorerHeaderContainer = styled(Stack)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  width: '100%',
  height: 36,
}));

const ExplorerHeaderTitle = styled(Typography)(({ theme }) => ({
  fontSize: 13,
  flexGrow: 1,
  fontWeight: theme.typography.fontWeightLight,
}));

export default function ExplorerHeader({
  headerText,
  headerIcon,
  onCreate,
  createLabelText,
}: ExplorerHeaderProps) {
  return (
    <ExplorerHeaderContainer
      direction="row"
      alignItems="center"
      justifyContent="space-between"
      sx={{ pl: 2.5 }}
    >
      {headerIcon}
      <ExplorerHeaderTitle
        variant="body2"
        sx={{
          mx: 0.5,
          my: 0.5,
        }}
      >
        {headerText}
      </ExplorerHeaderTitle>
      {onCreate && createLabelText ? (
        <Tooltip title={createLabelText}>
          <IconButton aria-label={createLabelText} size="medium" onClick={onCreate}>
            <AddIcon />
          </IconButton>
        </Tooltip>
      ) : null}
    </ExplorerHeaderContainer>
  );
}
