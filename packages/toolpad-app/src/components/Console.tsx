import { darken, IconButton, lighten, styled, SxProps } from '@mui/material';
import clsx from 'clsx';
import * as React from 'react';
import DoDisturbIcon from '@mui/icons-material/DoDisturb';
import Inspector, { InspectorProps } from 'react-inspector';
import inspectorTheme from '../inspectorTheme';
import { interleave } from '../utils/react';

export interface LogRequest {
  method: string;
  url: string;
  headers: [string, string][];
}

export interface LogResponse {
  status: number;
  statusText: string;
  ok: boolean;
  headers: [string, string][];
  bodyUsed: boolean;
  redirected: boolean;
  type: Response['type'];
  url: string;
}

export interface LogConsoleEntry {
  timestamp: number;
  level: string;
  kind: 'console';
  args: any[];
}

export interface LogRequestEntry {
  timestamp: number;
  kind: 'request';
  id: string;
  request: LogRequest;
}

export interface LogResponseEntry {
  timestamp: number;
  kind: 'response';
  id: string;
  response: LogResponse;
}

export type LogEntry = LogConsoleEntry | LogRequestEntry | LogResponseEntry;

const classes = {
  header: 'Toolpad_ConsoleHeader',
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

    [`& .${classes.header}`]: {
      padding: theme.spacing('2px', 1),
      borderBottom: `1px solid ${theme.palette.divider}`,
    },

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

function ConsoleInpector(props: InspectorProps) {
  return <Inspector {...props} theme={inspectorTheme} />;
}

interface ConsoleEntryProps<K = LogEntry['kind']> {
  entry: Extract<LogEntry, { kind: K }>;
}

function ConsoleLogEntry({ entry }: ConsoleEntryProps<'console'>) {
  return (
    <div className={clsx(classes.logEntry, entry.level)}>
      <div className={classes.logEntryText}>
        {interleave(
          entry.args.map((arg, i) =>
            typeof arg === 'string' ? arg : <ConsoleInpector key={i} data={arg} />,
          ),
          ' ',
        )}
      </div>
    </div>
  );
}

function ConsoleRequestEntry({ entry }: ConsoleEntryProps<'request'>) {
  return (
    <div className={classes.logEntry}>
      Request {entry.request.url} <ConsoleInpector data={entry.request} />
    </div>
  );
}

function ConsoleResponseEntry({ entry }: ConsoleEntryProps<'response'>) {
  return (
    <div className={classes.logEntry}>
      Response {entry.response.status} <ConsoleInpector data={entry.response} />
    </div>
  );
}

function ConsoleEntry({ entry }: ConsoleEntryProps) {
  switch (entry.kind) {
    case 'console':
      return <ConsoleLogEntry entry={entry} />;
    case 'request':
      return <ConsoleRequestEntry entry={entry} />;
    case 'response':
      return <ConsoleResponseEntry entry={entry} />;
    default:
      throw new Error(`Unknown console entry`);
  }
}

interface ConsoleProps {
  sx?: SxProps;
  value?: LogEntry[];
  onChange?: (logEntries: LogEntry[]) => void;
}

export default function Console({ value = [], onChange, sx }: ConsoleProps) {
  return (
    <ConsoleRoot sx={sx}>
      <div className={classes.header}>
        {onChange ? (
          <IconButton disabled={value.length <= 0} onClick={() => onChange([])}>
            <DoDisturbIcon />
          </IconButton>
        ) : null}
      </div>
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
