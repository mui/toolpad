import QRCode from 'qrcode';
import { createFunction } from '@mui/toolpad/server';

export const generateQrCode = createFunction(
  async ({ parameters }) => {
    return QRCode.toDataURL(parameters.content);
  },
  {
    helperText: 'Encodes text into a QR code.',
    parameters: {
      content: {
        helperText: 'The content to encode.',
        type: 'string',
      },
    },
  },
);
