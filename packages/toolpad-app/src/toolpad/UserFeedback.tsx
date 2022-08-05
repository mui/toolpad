import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import * as React from 'react';
import { createProvidedContext } from '../utils/react';
import useLatest from '../utils/useLatest';

const FEATURE_REQUEST_LINK =
  'https://github.com/mui/mui-toolpad/issues/new?assignees=&labels=status%3A+needs+triage&template=2.feature.yml';

export interface FutureComponentSpec {
  displayName: string;
  githubLink: string;
}

export type DialogParams =
  | { kind: 'default' }
  | {
      kind: 'futureComponent';
      futureComponent: FutureComponentSpec;
    };

const DEFAULT_DIALOG_PARAMS: DialogParams = { kind: 'default' };

interface FeedbackContext {
  showDialog(params?: DialogParams): void;
}

const [useUserFeedback, UserFeedbackprovider] = createProvidedContext<FeedbackContext>('Feedback');

function getDialogContent(params: DialogParams) {
  switch (params.kind) {
    case 'futureComponent':
      return (
        <React.Fragment>
          Looking for a <code>{params.futureComponent.displayName}</code> component? We&quot;re
          working on it. You can upvote the{' '}
          <a href={params.futureComponent.githubLink} target="_blank" rel="noreferrer">
            feature request
          </a>{' '}
          on our repository.
        </React.Fragment>
      );
    case 'default':
      return (
        <React.Fragment>
          Need a specific feature? You can open a{' '}
          <a href={FEATURE_REQUEST_LINK} target="_blank" rel="noreferrer">
            feature request
          </a>{' '}
          over at our GitHub repo or upvote an existing request.
        </React.Fragment>
      );

    default:
      throw new Error(`Missing case in switch statement "${(params as DialogParams).kind}"`);
  }
}

interface FeedbackDialogProps {
  open: boolean;
  onClose: () => void;
  params: DialogParams | null;
}

function FeedbackDialog({ open, onClose, params }: FeedbackDialogProps) {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>User feedback</DialogTitle>
      <DialogContent>{getDialogContent(params ?? DEFAULT_DIALOG_PARAMS)}</DialogContent>
      <DialogActions>
        <Button
          color="inherit"
          variant="text"
          onClick={() => {
            onClose();
          }}
        >
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export interface UserFeedbackProps {
  children?: React.ReactNode;
}

export default function UserFeedback({ children }: UserFeedbackProps) {
  const [dialogParams, setDialogParams] = React.useState<DialogParams | null>(null);
  const handleDialogClose = React.useCallback(() => setDialogParams(null), []);
  const showDialog = React.useCallback(
    (params?: DialogParams): void => setDialogParams(params || DEFAULT_DIALOG_PARAMS),
    [],
  );
  const context = React.useMemo(() => ({ showDialog }), [showDialog]);
  const latestParams = useLatest(dialogParams);
  return (
    <UserFeedbackprovider value={context}>
      {children}
      <FeedbackDialog open={!!dialogParams} onClose={handleDialogClose} params={latestParams} />
    </UserFeedbackprovider>
  );
}

export { useUserFeedback };
