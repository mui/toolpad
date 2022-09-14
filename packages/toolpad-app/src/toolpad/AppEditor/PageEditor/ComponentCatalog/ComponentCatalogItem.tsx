import * as React from 'react';
import Box from '@mui/material/Box';
import ComponentIcon from './ComponentIcon';

interface ComponentCatalogItemProps {
  draggable?: boolean;
  onDragStart?: (event: React.DragEvent<HTMLDivElement>) => void;
  onClick?: () => void;
  builtIn?: string;
  displayName: string;
  displayIcon?: string;
  kind?: 'future' | 'builtIn' | 'create';
}

const ComponentCatalogItem = ({
  draggable,
  onClick,
  displayName,
  displayIcon,
  builtIn,
  kind,
  onDragStart,
}: ComponentCatalogItemProps) => {
  return (
    <Box
      className="ComponentCatalogItem"
      onClick={onClick}
      draggable={draggable}
      onDragStart={onDragStart}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        width: builtIn ? 75 : 70,
        height: builtIn ? 75 : 70,
        padding: (theme) => theme.spacing(1, 1, 1, 1),
        borderRadius: (theme) => theme.shape.borderRadius,
        border: (theme) => `1px solid ${theme.palette.divider}`,
        borderStyle: kind === 'create' ? 'dashed' : 'solid',
        color: (theme) => theme.palette.text.secondary,
        '&:hover': (theme) => {
          return {
            background: theme.palette.action.hover,
          };
        },
        ...(draggable ? { cursor: 'grab' } : {}),
        ...(onClick ? { cursor: 'pointer' } : {}),
      }}
    >
      {displayIcon ? <ComponentIcon name={displayIcon} kind={kind} /> : null}
      <span
        style={{
          fontSize: '0.625rem',
          maxWidth: builtIn ? 65 : 60,
          whiteSpace: 'nowrap',
          textOverflow: 'ellipsis',
          overflow: 'hidden',
        }}
      >
        {displayName}
      </span>
    </Box>
  );
};

export default ComponentCatalogItem;
