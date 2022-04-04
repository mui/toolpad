export type GoogleSheetsConnectionParams = {
  refresh_token?: string | null;
  expiry_date?: number | null;
  access_token?: string | null;
  token_type?: string | null;
  id_token?: string | null;
};

export type GoogleSpreadsheet = {
  /**
   * The ID of the file.
   */
  id: string;
  /**
   * Identifies what kind of resource this is. Value: the fixed string
   * 'drive#file'.
   */
  kind: string;
  /**
   * The name of the file.
   */
  name: string;
  /**
   * The MIME type of the file.
   */
  mimeType: string;
  /**
   * The major dimension of the values.  For output, if the spreadsheet data
   * is: `A1=1,B1=2,A2=3,B2=4`, then requesting
   * `range=A1:B2,majorDimension=ROWS` will return `[[1,2],[3,4]]`, whereas
   * requesting `range=A1:B2,majorDimension=COLUMNS` will return
   * `[[1,3],[2,4]]`.  For input, with `range=A1:B2,majorDimension=ROWS` then
   * `[[1,2],[3,4]]` will set `A1=1,B1=2,A2=3,B2=4`. With
   * `range=A1:B2,majorDimension=COLUMNS` then `[[1,2],[3,4]]` will set
   * `A1=1,B1=3,A2=2,B2=4`.  When writing, if this field is not set, it
   * defaults to ROWS.
   */
  majorDimension: string;
  /**
   * The range the values cover, in A1 notation. For output, this range
   * indicates the entire requested range, even though the values will exclude
   * trailing rows and columns. When appending values, this field represents
   * the range to search for a table, after which values will be appended.
   */
  range: string;
  /**
   * The data that was read or to be written.  This is an array of arrays, the
   * outer array representing all the data and each inner array representing a
   * major dimension. Each item in the inner array corresponds with one cell.
   * For output, empty trailing rows and columns will not be included.  For
   * input, supported value types are: bool, string, and double. Null values
   * will be skipped. To set a cell to an empty value, set the string value to
   * an empty string.
   */
  values: any[][];
};

export type GoogleSheet = {
  /**
   * The index of the sheet within the spreadsheet.
   */
  index: number;
  /**
   * The ID of the sheet. Must be non-negative.
   */
  sheetId: number;
  /**
   * The type of sheet. Defaults to GRID.
   */
  sheetType: string;
  /**
   * The name of the sheet.
   */
  title: string;
};

export type GoogleSheetsApiQuery = {
  /**
   * The ranges to retrieve from the spreadsheet.
   */
  ranges: string;
  /**
   * The spreadsheet to request.
   */
  spreadsheetId: GoogleSpreadsheet['id'] | null;
  /**
   * The sheet to request.
   */
  sheetName: GoogleSheet['title'] | null;
};

export enum GoogleSheetsPrivateQueryType {
  FETCH_SHEET = 'FETCH_SHEET',
  FETCH_SPREADSHEETS = 'FETCH_SPREADSHEETS',
}

export type GoogleSheetsPrivateQuery =
  | {
      type: GoogleSheetsPrivateQueryType.FETCH_SPREADSHEETS;
    }
  | {
      type: GoogleSheetsPrivateQueryType.FETCH_SHEET;
      spreadsheetId: GoogleSheetsApiQuery['spreadsheetId'];
    };
