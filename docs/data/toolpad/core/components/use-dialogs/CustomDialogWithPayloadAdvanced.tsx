import * as React from 'react';
import { DialogsProvider, useDialogs, DialogProps } from '@toolpad/core/useDialogs';
import Button from '@mui/material/Button';
import LoadingButton from '@mui/lab/LoadingButton';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import Stack from '@mui/material/Stack';
import MenuItem from '@mui/material/MenuItem';
import {
  FormContext,
  useFormContext,
  type TransferFormData,
} from './TransferFormContext';

function mockTransfer(formData: TransferFormData): Promise<string> {
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log('FormData', formData);
      const uuid = crypto.randomUUID();
      resolve(uuid);
    }, 1000);
  });
}

function TransactionDialog({
  payload,
  open,
  onClose,
}: DialogProps<React.ReactNode, string | null>) {
  const [loading, setLoading] = React.useState(false);
  const { formData } = useFormContext();

  return (
    <Dialog fullWidth open={open} onClose={() => onClose(null)}>
      <DialogTitle>Confirm transfer</DialogTitle>
      <DialogContent>{payload}</DialogContent>
      <DialogActions>
        <LoadingButton
          loading={loading}
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
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
}

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
            accountType: event.target.value as 'checking' | 'savings',
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
  const Payload = country === 'usa' ? <PayloadUSA /> : <PayloadIndia />;

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
          const uuid = await dialogs.open(TransactionDialog, Payload);

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
  const [formData, setFormData] = React.useState<TransferFormData>({
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