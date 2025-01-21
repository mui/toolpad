import * as React from 'react';
import PropTypes from 'prop-types';
import { DialogsProvider, useDialogs } from '@toolpad/core/useDialogs';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import Stack from '@mui/material/Stack';
import MenuItem from '@mui/material/MenuItem';
import { FormContext, useFormContext } from './TransferFormContext';

function mockTransfer(formData) {
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log('FormData', formData);
      const uuid = crypto.randomUUID();
      resolve(uuid);
    }, 1000);
  });
}

function TransactionDialog({ payload, open, onClose }) {
  const [loading, setLoading] = React.useState(false);
  const { formData } = useFormContext();

  const isValidCsrf = React.useMemo(() => {
    if (payload.data) {
      return true;
    }
    return false;
  }, [payload.data]);

  return (
    <Dialog fullWidth open={open} onClose={() => onClose(null)}>
      <DialogTitle>Confirm transfer</DialogTitle>
      <DialogContent>{payload.component}</DialogContent>
      <DialogActions>
        <Button
          loading={loading}
          disabled={!isValidCsrf}
          onClick={async () => {
            setLoading(true);
            try {
              const uuid = await mockTransfer(formData);
              onClose(uuid);
            } finally {
              setLoading(false);
            }
          }}
        >
          Submit
        </Button>
      </DialogActions>
    </Dialog>
  );
}

TransactionDialog.propTypes = {
  /**
   * A function to call when the dialog should be closed. If the dialog has a return
   * value, it should be passed as an argument to this function. You should use the promise
   * that is returned to show a loading state while the dialog is performing async actions
   * on close.
   * @param result The result to return from the dialog.
   * @returns A promise that resolves when the dialog can be fully closed.
   */
  onClose: PropTypes.func.isRequired,
  /**
   * Whether the dialog is open.
   */
  open: PropTypes.bool.isRequired,
  /**
   * The payload that was passed when the dialog was opened.
   */
  payload: PropTypes.shape({
    component: PropTypes.node,
    data: PropTypes.string.isRequired,
  }).isRequired,
};

function PayloadIndia() {
  const { formData, setFormData } = useFormContext();

  return (
    <Stack spacing={2} padding={1}>
      <TextField
        label="Amount"
        value={formData.amount}
        onChange={(event) =>
          setFormData({ ...formData, amount: event.target.value })
        }
        placeholder="Enter amount in rupees"
        slotProps={{
          input: {
            endAdornment: '₹',
          },
        }}
      />
      <TextField
        label="IFSC Code"
        value={formData.ifscCode}
        onChange={(event) =>
          setFormData({ ...formData, ifscCode: event.target.value })
        }
        placeholder="Enter 11-character IFSC code"
        helperText="Bank branch identifier code (e.g. HDFC0001234)"
      />
      <TextField
        label="Account Number"
        value={formData.accountNumber}
        onChange={(event) =>
          setFormData({ ...formData, accountNumber: event.target.value })
        }
        placeholder="Enter bank account number"
        helperText="Please verify the account number carefully"
      />
    </Stack>
  );
}

function PayloadUSA() {
  const { formData, setFormData } = useFormContext();

  return (
    <Stack spacing={2} padding={1}>
      <TextField
        label="Amount"
        value={formData.amount}
        onChange={(event) =>
          setFormData({ ...formData, amount: event.target.value })
        }
        placeholder="Enter amount in dollars"
        slotProps={{
          input: {
            endAdornment: '$',
          },
        }}
      />
      <TextField
        label="Routing Number"
        value={formData.routingNumber}
        onChange={(event) =>
          setFormData({ ...formData, routingNumber: event.target.value })
        }
        placeholder="123456789"
        helperText="ABA routing transit number (e.g. 021000021)"
      />
      <TextField
        label="Account Number"
        value={formData.accountNumber}
        onChange={(event) =>
          setFormData({ ...formData, accountNumber: event.target.value })
        }
        placeholder="Enter 10-12 digit account number"
        helperText="US bank account number (typically 10-12 digits)"
      />
      <TextField
        label="Account Type"
        select
        value={formData.accountType}
        onChange={(event) => {
          console.log('changing', event.target.value);
          setFormData({
            ...formData,
            accountType: event.target.value,
          });
        }}
        defaultValue="checking"
        placeholder="Select account type"
      >
        <MenuItem value="checking">Checking</MenuItem>
        <MenuItem value="savings">Savings</MenuItem>
      </TextField>
    </Stack>
  );
}

function DemoContent() {
  const dialogs = useDialogs();
  const [country, setCountry] = React.useState('usa');
  const csrfToken = crypto.randomUUID();

  return (
    <Stack spacing={2}>
      <TextField
        select
        label="Country"
        value={country}
        onChange={(event) => setCountry(event.target.value)}
        sx={{ minWidth: 200 }}
      >
        <MenuItem value="usa">United States</MenuItem>
        <MenuItem value="india">India</MenuItem>
      </TextField>

      <Button
        onClick={async () => {
          // preview-start
          const uuid = await dialogs.open(TransactionDialog, {
            component: country === 'usa' ? <PayloadUSA /> : <PayloadIndia />,
            data: csrfToken,
          });
          // preview-end
          if (uuid) {
            dialogs.alert(`The transaction was completed with ID: ${uuid}`, {
              title: 'Success',
            });
          }
        }}
      >
        Open
      </Button>
    </Stack>
  );
}

export default function CustomDialogWithPayloadAdvanced() {
  const [formData, setFormData] = React.useState({
    amount: '',
    accountNumber: '',
  });

  const contextValue = React.useMemo(() => ({ formData, setFormData }), [formData]);

  return (
    <FormContext.Provider value={contextValue}>
      <DialogsProvider>
        <DemoContent />
      </DialogsProvider>
    </FormContext.Provider>
  );
}
