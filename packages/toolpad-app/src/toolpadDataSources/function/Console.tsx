import { styled, SxProps } from '@mui/material';
import * as React from 'react';
import Inspector, { chromeLight, InspectorProps, InspectorTheme } from 'react-inspector';
import { interleave } from '../../utils/react';
import { LogEntry } from './types';

const classes = {
  logEntries: 'Toolpad_ConsoleLogEntries',
  logEntry: 'Toolpad_ConsoleLogEntry',
  logEntryText: 'Toolpad_ConsoleLogEntryTExt',
};

const ConsoleRoot = styled('div')(({ theme }) => ({
  overflow: 'auto',

  fontSize: 12,
  lineHeight: 1.2,
  fontFamily: 'Consolas, Menlo, Monaco, "Andale Mono", "Ubuntu Mono", monospace',

  // This container has only a single item, but the column-reverse has the effect that it
  // keeps the scroll position at the bottom when the content grows
  display: 'flex',
  flexDirection: 'column-reverse',

  [`& .${classes.logEntry}`]: {
    '&:first-child': {
      borderTop: `1px solid ${theme.palette.divider}`,
    },
    borderBottom: `1px solid ${theme.palette.divider}`,
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(1),
    paddingTop: 3,
    paddingBottom: 1,
  },

  [`& .${classes.logEntryText} > *`]: {
    display: 'inline-block',
    verticalAlign: 'top',
  },
}));

const INSPECTOR_THEME: InspectorTheme = {
  ...chromeLight,

  TREENODE_FONT_FAMILY: 'inherit',
  TREENODE_FONT_SIZE: 'inherit',
  ARROW_FONT_SIZE: 'inherit',
  TREENODE_LINE_HEIGHT: 'inherit',
};

function ConsoleInpector(props: InspectorProps) {
  return <Inspector {...props} theme={INSPECTOR_THEME} />;
}

interface ConsoleEntryProps<K = LogEntry['kind']> {
  entry: Extract<LogEntry, { kind: K }>;
}

function ConsoleLogEntry({ entry }: ConsoleEntryProps<'console'>) {
  return (
    <div className={classes.logEntry}>
      <div className={classes.logEntryText}>
        {interleave(
          entry.args.map((arg) => (typeof arg === 'string' ? arg : <ConsoleInpector data={arg} />)),
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
  entries: LogEntry[];
}

export default function Console({ entries, sx }: ConsoleProps) {
  return (
    <ConsoleRoot sx={sx}>
      <div className={classes.logEntries}>
        {entries.map((entry) => (
          <ConsoleEntry entry={entry} />
        ))}
      </div>
    </ConsoleRoot>
  );
}
