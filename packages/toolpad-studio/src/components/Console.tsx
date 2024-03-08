import { darken, lighten, styled, SxProps } from '@mui/material';
import clsx from 'clsx';
import * as React from 'react';
import { interleave } from '@toolpad/utils/react';
import ObjectInspector from './ObjectInspector';

export interface LogEntry {
  timestamp: number;
  level: string;
  args: any[];
}

const classes = {
  logEntriesContainer: 'Toolpad_ConsoleLogEntriesContainer',
  logEntries: 'Toolpad_ConsoleLogEntries',
  logEntry: 'Toolpad_ConsoleLogEntry',
  logEntryText: 'Toolpad_ConsoleLogEntryTExt',
};

const ConsoleRoot = styled('div')(({ theme }) => {
  const getColor = (color: string) => {
    const modify = theme.palette.mode === 'light' ? darken : lighten;
    return modify(color, 0.6);
  };

  const getBackgroundColor = (color: string) => {
    const modify = theme.palette.mode === 'light' ? lighten : darken;
    return modify(color, 0.9);
  };

  return {
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch',

    [`& .${classes.logEntriesContainer}`]: {
      flex: 1,

      // This container has only a single item, but the column-reverse has the effect that it
      // keeps the scroll position at the bottom when the content grows
      display: 'flex',
      flexDirection: 'column-reverse',
      overflow: 'auto',

      fontSize: 12,
      lineHeight: 1.2,
      fontFamily: 'Consolas, Menlo, Monaco, "Andale Mono", "Ubuntu Mono", monospace',
    },

    [`& .${classes.logEntry}`]: {
      '&:first-of-type': {
        borderTop: `1px solid ${theme.palette.divider}`,
      },
      borderBottom: `1px solid ${theme.palette.divider}`,
      paddingLeft: theme.spacing(1),
      paddingRight: theme.spacing(1),
      paddingTop: 3,
      paddingBottom: 1,
    },

    [`& .${classes.logEntry}.error`]: {
      color: getColor(theme.palette.error.light),
      background: getBackgroundColor(theme.palette.error.light),
    },

    [`& .${classes.logEntry}.warn`]: {
      color: getColor(theme.palette.warning.light),
      background: getBackgroundColor(theme.palette.warning.light),
    },

    [`& .${classes.logEntry}.info`]: {
      color: getColor(theme.palette.info.light),
      background: getBackgroundColor(theme.palette.info.light),
    },

    [`& .${classes.logEntryText} > *`]: {
      display: 'inline-block',
      verticalAlign: 'top',
    },
  };
});

interface ConsoleEntryProps {
  entry: LogEntry;
}

function ConsoleEntry({ entry }: ConsoleEntryProps) {
  return (
    <div className={clsx(classes.logEntry, entry.level)}>
      <div className={classes.logEntryText}>
        {interleave(
          entry.args.map((arg, i) =>
            typeof arg === 'string' ? arg : <ObjectInspector key={i} data={arg} />,
          ),
          ' ',
        )}
      </div>
    </div>
  );
}

interface ConsoleProps {
  sx?: SxProps;
  value?: LogEntry[];
}

export default function Console({ value = [], sx }: ConsoleProps) {
  return (
    <ConsoleRoot sx={sx}>
      <div className={classes.logEntriesContainer}>
        <div className={classes.logEntries}>
          {value.map((entry, i) => (
            <ConsoleEntry key={i} entry={entry} />
          ))}
        </div>
      </div>
    </ConsoleRoot>
  );
}
