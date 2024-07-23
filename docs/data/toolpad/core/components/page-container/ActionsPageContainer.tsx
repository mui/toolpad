import * as React from 'react';
import { useDemoRouter } from '@toolpad/core/internals/demo';
import { PageContainer, PageContainerToolbar } from '@toolpad/core/PageContainer';
import { AppProvider } from '@toolpad/core/AppProvider';
import { LocalizationProvider } from '@mui/x-date-pickers-pro/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers-pro/AdapterDayjs';
import { SingleInputDateRangeField } from '@mui/x-date-pickers-pro/SingleInputDateRangeField';
import { DateRangePicker } from '@mui/x-date-pickers-pro/DateRangePicker';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Unstable_Grid2';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import dayjs from 'dayjs';
import { Paper } from '@mui/material';

const NAVIGATION = [
  { segment: '', title: 'Weather' },
  { segment: 'orders', title: 'Orders' },
];

function Content() {
  return (
    <Grid container spacing={3}>
      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
        <Card variant="outlined">
          <CardContent>
            <Typography variant="caption">Temperature</Typography>
            <Typography variant="h4">24°C</Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
        <Card variant="outlined">
          <CardContent>
            <Typography variant="caption">Precipitation</Typography>
            <Typography variant="h4">5%</Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
        <Card variant="outlined">
          <CardContent>
            <Typography variant="caption">Wind</Typography>
            <Typography variant="h4">18km/h</Typography>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
}

// preview-start
function PageToolbar() {
  return (
    <PageContainerToolbar>
      <Button startIcon={<FileDownloadIcon />} color="inherit">
        Export
      </Button>
      <DateRangePicker
        sx={{ width: 220 }}
        defaultValue={[dayjs(), dayjs().add(14, 'day')]}
        slots={{ field: SingleInputDateRangeField }}
        slotProps={{ field: { size: 'small' } as any }}
        label="Period"
      />
    </PageContainerToolbar>
  );
}
// preview-end

export default function ActionsPageContainer() {
  const router = useDemoRouter();

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <AppProvider navigation={NAVIGATION} router={router}>
        <Paper sx={{ width: '100%' }}>
          <PageContainer slots={{ toolbar: PageToolbar }}>
            <Content />
          </PageContainer>
        </Paper>
      </AppProvider>
    </LocalizationProvider>
  );
}
