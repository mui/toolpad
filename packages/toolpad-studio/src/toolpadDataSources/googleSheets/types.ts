import { sheets_v4 } from '@googleapis/sheets';
import { drive_v3 } from '@googleapis/drive';
import { ExecFetchResult } from '@toolpad/studio-runtime';

export type GoogleSheetsConnectionParams = {
  refresh_token?: string | null;
  expiry_date?: number | null;
  access_token?: string | null;
  token_type?: string | null;
  id_token?: string | null;
};

export type GoogleDriveFile = drive_v3.Schema$File;

export type GoogleSpreadsheet = sheets_v4.Schema$Spreadsheet;

export type GoogleSheet = sheets_v4.Schema$Sheet;

type GoogleSheetProperties = sheets_v4.Schema$SheetProperties;

export type GoogleDriveFiles = drive_v3.Schema$FileList;

export type GoogleDriveUser = drive_v3.Schema$User;

export type GoogleSheetsApiQuery = {
  /**
   * The ranges to retrieve from the spreadsheet.
   */
  ranges: string;
  /**
   * The spreadsheet to request.
   */
  spreadsheetId: GoogleDriveFile['id'];
  /**
   * The sheet to request.
   */
  sheetName: GoogleSheetProperties['title'];
  /**
   * Whether to transform the response assuming
   * the first row to be column headers
   */
  headerRow: boolean;
};

export type GoogleSheetsPrivateQuery =
  | {
      type: 'FILE_GET';
      spreadsheetId: GoogleSheetsApiQuery['spreadsheetId'];
    }
  | {
      type: 'FILES_LIST';
      spreadsheetQuery?: string | null;
      pageToken?: string;
    }
  | {
      type: 'FETCH_SPREADSHEET';
      spreadsheetId: GoogleSheetsApiQuery['spreadsheetId'];
    }
  | {
      type: 'CONNECTION_STATUS';
    }
  | {
      type: 'DEBUG_EXEC';
      query: GoogleSheetsApiQuery;
    };

export interface GoogleSheetsResult extends ExecFetchResult {}
