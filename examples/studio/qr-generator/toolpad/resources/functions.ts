import QRCode from 'qrcode';

export async function generateQrCode(content: string) {
  return QRCode.toDataURL(content);
}
