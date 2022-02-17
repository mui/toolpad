import { sheets_v4 } from 'googleapis';
import { Credentials } from 'google-auth-library';

export type GoogleSheetsConnectionParams = Credentials | null;

export type GoogleSheetsQuery = sheets_v4.Params$Resource$Spreadsheets$Get | null;
