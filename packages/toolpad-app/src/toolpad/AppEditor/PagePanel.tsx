import * as React from 'react';
import {
  styled,
  SxProps,
  Box,
  IconButton,
  Divider,
  Typography,
  Accordion,
  AccordionDetails,
  AccordionSummary as MuiAccordionSummary,
  AccordionSummaryProps,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import PagesHierarchyExplorer from './HierarchyExplorer';
import PageStructureExplorer from './StructureExplorer';
import CreatePageNodeDialog from './CreatePageNodeDialog';
import { useDom } from '../AppState';
import AppOptions from '../AppOptions';
import config from '../../config';

const PagePanelRoot = styled('div')({
  display: 'flex',
  flexDirection: 'column',
});

export interface ComponentPanelProps {
  className?: string;
  sx?: SxProps;
}

const AccordionSummary = styled((props: AccordionSummaryProps) => (
  <MuiAccordionSummary expandIcon={<ExpandMoreIcon sx={{ fontSize: '0.9rem' }} />} {...props} />
))(({ theme }) => ({
  flexDirection: 'row-reverse',

  '& .MuiAccordionSummary-content': {
    marginLeft: theme.spacing(1),
    justifyContent: 'space-between',
  },
}));

export default function PagePanel({ className, sx }: ComponentPanelProps) {
  const { dom } = useDom();

  const [createPageDialogOpen, setCreatePageDialogOpen] = React.useState(0);
  const handleCreatePageDialogOpen = React.useCallback((event: React.MouseEvent) => {
    event.stopPropagation();
    setCreatePageDialogOpen(Math.random());
  }, []);
  const handleCreatepageDialogClose = React.useCallback(() => setCreatePageDialogOpen(0), []);

  return (
    <PagePanelRoot className={className} sx={sx}>
      <Box
        sx={{
          pl: 2,
          pr: 1,
          py: 1,
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Typography noWrap>{config.projectDir?.split(/[/\\]/).pop()}</Typography>
        <AppOptions dom={dom} />
      </Box>
      <Divider />
      <Accordion elevation={0} defaultExpanded disableGutters>
        <AccordionSummary>
          <Typography sx={{ fontSize: '0.9rem', fontWeight: 500 }}>Pages</Typography>
          <IconButton size="small" aria-label={'Create page'} onClick={handleCreatePageDialogOpen}>
            <AddIcon sx={{ fontSize: '0.9rem' }} />
          </IconButton>
        </AccordionSummary>
        <AccordionDetails sx={{ py: 0 }}>
          <PagesHierarchyExplorer />
        </AccordionDetails>
      </Accordion>
      <Divider />
      <Accordion elevation={0} disableGutters defaultExpanded>
        <AccordionSummary>
          <Typography sx={{ fontSize: '0.9rem', fontWeight: 500 }}>Components</Typography>
        </AccordionSummary>
        <AccordionDetails sx={{ py: 0 }}>
          <PageStructureExplorer />
        </AccordionDetails>
      </Accordion>
      <CreatePageNodeDialog
        key={createPageDialogOpen || undefined}
        open={!!createPageDialogOpen}
        onClose={handleCreatepageDialogClose}
      />
    </PagePanelRoot>
  );
}
