import { drive_v3, sheets_v4 } from 'googleapis';

export type GoogleSheetsConnectionParams = {
  refresh_token?: string | null;
  expiry_date?: number | null;
  access_token?: string | null;
  token_type?: string | null;
  id_token?: string | null;
};

export type GoogleDriveFile = Pick<drive_v3.Schema$File, 'id' | 'kind' | 'name' | 'mimeType'>;

export type GoogleSpreadsheetProperties = Pick<
  sheets_v4.Schema$SpreadsheetProperties,
  'title' | 'locale'
>;

export type GoogleSheetProperties = Pick<
  sheets_v4.Schema$SheetProperties,
  'sheetId' | 'title' | 'sheetType' | 'index'
>;

export type GoogleSpreadsheet = Pick<sheets_v4.Schema$Spreadsheet, 'spreadsheetId'> & {
  properties: GoogleSpreadsheetProperties;
  sheets: GoogleSheet[];
};

export type GoogleSheet = {
  properties: GoogleSheetProperties;
};

export type GoogleDriveFiles = {
  files: GoogleDriveFile[];
};

export type GoogleSheetsApiQuery = {
  /**
   * The ranges to retrieve from the spreadsheet.
   */
  ranges: string;
  /**
   * The spreadsheet to request.
   */
  spreadsheetId: GoogleDriveFile['id'] | null;
  /**
   * The sheet to request.
   */
  sheetName: GoogleSheetProperties['title'] | null;
};

export enum GoogleSheetsPrivateQueryType {
  FILE_GET = 'FILE_GET',
  FILES_LIST = 'FILES_LIST',
  FETCH_SPREADSHEET = 'FETCH_SPREADSHEET',
}

export type GoogleSheetsPrivateQuery =
  | {
      type: GoogleSheetsPrivateQueryType.FILE_GET;
      spreadsheetId: string;
    }
  | {
      type: GoogleSheetsPrivateQueryType.FILES_LIST;
      spreadsheetQuery?: string | null;
      pageToken?: string;
    }
  | {
      type: GoogleSheetsPrivateQueryType.FETCH_SPREADSHEET;
      spreadsheetId: GoogleSheetsApiQuery['spreadsheetId'];
    };
