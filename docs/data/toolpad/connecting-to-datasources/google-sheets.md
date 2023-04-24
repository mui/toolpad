# Google Sheets datasource

<p class="description">Google Sheets datasource allows fetching data from Google Sheets living in your Google Drive.</p>

## Working with Google Sheets

1. Create a new Google Sheets connection as explained in the [instructions](/toolpad/connecting-to-datasources/connections/#google-sheets).

1. Once your connection is ready click on **ADD QUERY** in the **Inspector** on the right.

1. Select Google Sheets datasource and click **CREATE QUERY**:

   <img src="/static/toolpad/docs/google-sheets/sheets-1.png" alt="Google Sheets type" width="590px" style="margin-bottom: 16px;" />

1. You can modify all the basic configuration settings as described in [queries](/toolpad/connecting-to-datasources/queries/) section.

1. In addition you can configure following properties inline:

   <img src="/static/toolpad/docs/google-sheets/sheets-2.png" alt="Google Sheets configuration" width="1438" />

   - **Select spreadsheet** - browse for a spreadsheet that you own or that is shared with you.

   - **Select sheet** - choose a spreadsheet's sheet from which you want to pull the data.

   - **Range** - select a range of cells from which the data should be pulled.

   - **First row contains column headers** - enable this setting if you would like to use names defined in a header row as the name for object keys in a response.

1. Once finished with configuration click **SAVE** to commit your changes and return to the canvas.
