import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from '@mui/material';
import * as React from 'react';
import invariant from 'invariant';
import * as appDom from '../../../appDom';
import { useDom, useDomApi } from '../../DomLoader';
import { format } from '../../../utils/prettier';
import DialogForm from '../../../components/DialogForm';
import useEvent from '../../../utils/useEvent';
import { useNodeNameValidation } from './validation';

const DEFAULT_NAME = 'MyComponent';

function createDefaultCodeComponent(name: string): string {
  const componentId = name.replace(/\s/g, '');
  const propTypeId = `${componentId}Props`;
  return format(`
    import * as React from 'react';
    import { Typography } from '@mui/material';
    import { createComponent } from '@mui/toolpad-core';
    
    export interface ${propTypeId} {
      msg: string;
    }
    
    function ${componentId}({ msg }: ${propTypeId}) {
      return (
        <Typography>{msg}</Typography>
      );
    }

    export default createComponent(${componentId}, {
      argTypes: {
        msg: {
          typeDef: { type: "string", default: "Hello world!" },
        },
      },
    });    
  `);
}

export interface CreateCodeComponentDialogProps {
  appId: string;
  open: boolean;
  onClose: () => void;
}

export default function CreateCodeComponentDialog({
  appId,
  open,
  onClose,
  ...props
}: CreateCodeComponentDialogProps) {
  const { dom } = useDom();
  const domApi = useDomApi();

  const existingNames = React.useMemo(
    () => appDom.getExistingNamesForChildren(dom, appDom.getApp(dom), 'codeComponents'),
    [dom],
  );

  const [name, setName] = React.useState(appDom.proposeName(DEFAULT_NAME, existingNames));

  // Reset form
  const handleReset = useEvent(() => setName(appDom.proposeName(DEFAULT_NAME, existingNames)));

  React.useEffect(() => {
    if (open) {
      handleReset();
    }
  }, [open, handleReset]);

  const handleInputFocus = React.useCallback((event: React.FocusEvent<HTMLInputElement>) => {
    event.target.select();
  }, []);

  const inputErrorMsg = useNodeNameValidation(name, existingNames, 'component');
  const isNameValid = !inputErrorMsg;
  const isFormValid = isNameValid;

  return (
    <Dialog open={open} onClose={onClose} {...props}>
      <DialogForm
        autoComplete="off"
        onSubmit={(event) => {
          invariant(isFormValid, 'Invalid form should not be submitted when submit is disabled');

          event.preventDefault();
          const newNode = appDom.createNode(dom, 'codeComponent', {
            name,
            attributes: {
              code: appDom.createConst(createDefaultCodeComponent(name)),
            },
          });
          const appNode = appDom.getApp(dom);

          domApi.update((draft) => appDom.addNode(draft, newNode, appNode, 'codeComponents'), {
            kind: 'codeComponent',
            nodeId: newNode.id,
          });

          onClose();
        }}
      >
        <DialogTitle>Create a new Code Component</DialogTitle>
        <DialogContent>
          <TextField
            sx={{ my: 1 }}
            required
            onFocus={handleInputFocus}
            autoFocus
            fullWidth
            label="name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            error={!isNameValid}
            helperText={inputErrorMsg}
          />
        </DialogContent>
        <DialogActions>
          <Button color="inherit" variant="text" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={!isFormValid}>
            Create
          </Button>
        </DialogActions>
      </DialogForm>
    </Dialog>
  );
}
