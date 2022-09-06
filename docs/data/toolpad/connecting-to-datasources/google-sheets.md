# Google Sheets

<p class="description">Google Sheets datasource allows us to fetch data from Google sheets living in your Google Drive.</p>

## Working with Google Sheets

As explained in the [connections](/toolpad/connecting-to-datasources/connections/) section before you can use `Google Sheets` query you will first need to setup `connection`:

1. Once your `connection` is ready click on `ADD QUERY` in the `Properties editor` on the right.

1. Select `Google Sheets` datasource and click `CREATE QUERY`:

   ![Google sheets type](/static/toolpad/google-sheets-query-1.png)

1. We got all the basic configuration settings as described in [queries](/toolpad/connecting-to-datasources/queries/) section.

1. In addition we can configure following properties inline:

   ![Google sheets configuration](/static/toolpad/google-sheets-query-2.png)

   - `Select spreadsheet` - browse for a spreadsheet that you own or that is shared with you.

   - `Select sheet` - choose a spreadsheet's sheet from which you want to pull the data.

   - `Range` - select a range of cells from which the data should be pulled.

   - `First row contains column headers` - enable this setting if you would like to use names defined in a header row as the name for object keys in a response.

1. Once finished with configuration click `SAVE` and click anywhere outside of the dialog to return to the editor.
