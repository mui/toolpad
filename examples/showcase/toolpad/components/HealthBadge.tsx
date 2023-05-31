import * as React from 'react';
import { Box, Typography, Stack } from '@mui/material';
import { createComponent } from '@mui/toolpad/browser';

export interface HeathBadgeProps {
  level: string;
}

const levelsInfo = {
  ok: {
    label: 'Ok',
    backgroundColor: 'green',
  },
  warning: {
    label: 'Warning',
    backgroundColor: 'orange',
  },
  problem: {
    label: 'Problem',
    backgroundColor: 'red',
  },
  unknown: {
    label: 'Unknown',
    backgroundColor: 'grey',
  },
};

// Using this style https://about.gitlab.com/handbook/marketing/performance-indicators/#legends
function HeathBadge({ level }: HeathBadgeProps) {
  const info = levelsInfo[level];
  return (
    <Box
      sx={{
        backgroundColor: info.backgroundColor,
        color: 'white',
        borderRadius: '0.2em',
        fontWeight: 700,
        fontSize: 14,
        display: 'flex',
        alignItems: 'center',
        padding: '2px 12px',
        textAlign: 'center',
      }}
    >
      {info.label}
    </Box>
  );
}

interface ReportProps {
  value: number;
  warning: number;
  problem: number;
  unit: string;
  lowerIsBetter: boolean;
}

function Report(props: ReportProps) {
  let level = 'unknown';
  const { value, warning, problem, unit, lowerIsBetter } = props;

  if (lowerIsBetter) {
    if (value > problem) {
      level = 'problem';
    } else if (value > warning) {
      level = 'warning';
    } else if (value !== undefined) {
      level = 'ok';
    }
  } else if (value < problem) {
    level = 'problem';
  } else if (value < warning) {
    level = 'warning';
  } else if (value !== undefined) {
    level = 'ok';
  }

  return (
    <Stack spacing={0.5}>
      <Stack direction="row" spacing={1}>
        <Typography sx={{ width: 100 }}>Health:</Typography>
        <HeathBadge level={level} />
      </Stack>
      <Stack direction="row" spacing={1}>
        <Typography sx={{ width: 100 }}>Value:</Typography>
        <Typography>{`${value} ${unit}`}</Typography>
      </Stack>
    </Stack>
  );
}

export default createComponent(Report, {
  argTypes: {
    value: {
      typeDef: { type: 'number' },
      defaultValue: undefined,
    },
    warning: {
      typeDef: { type: 'number' },
      defaultValue: 1,
    },
    problem: {
      typeDef: { type: 'number' },
      defaultValue: 1,
    },
    unit: {
      typeDef: { type: 'string' },
      defaultValue: '%',
    },
    lowerIsBetter: {
      typeDef: { type: 'boolean' },
      defaultValue: false,
    },
  },
});
