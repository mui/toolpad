export type GoogleSheetsConnectionParams = {
  refresh_token?: string | null;
  expiry_date?: number | null;
  access_token?: string | null;
  token_type?: string | null;
  id_token?: string | null;
};

//TODO: Add 'REFRESH' for access_token expired cases
export type ConnectionStage = 'CREATE' | 'REDIRECT';

export type GoogleSheetsQuery = {
  /**
   * True if grid data should be returned. This parameter is ignored if a
   * field mask was set in the request.
   */
  includeGridData?: boolean;
  /**
   * The ranges to retrieve from the spreadsheet.
   */
  ranges?: string[];
  /**
   * The spreadsheet to request.
   */
  spreadsheetId?: string;
};
