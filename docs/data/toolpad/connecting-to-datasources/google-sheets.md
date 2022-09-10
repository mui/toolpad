# Google Sheets datasource

<p class="description">Google Sheets datasource allows fetching data from Google Sheets living in your Google Drive.</p>

## Working with Google Sheets

As explained in the [connections](/toolpad/connecting-to-datasources/connections/) section you can either create a reusable connection or simply create a new query and put all connection details inline:

1. Once your connection is ready click on **ADD QUERY** in the **Inspector** on the right.

1. Select Google Sheets datasource and click **CREATE QUERY**:

   <img src="/static/toolpad/google-sheets-query-1.png" alt="Google Sheets type" width="595px" style="margin-bottom: 16px;" />

1. You can modify all the basic configuration settings as described in [queries](/toolpad/connecting-to-datasources/queries/) section.

1. In addition you can configure following properties inline:

   <img src="/static/toolpad/google-sheets-query-2.png" alt="Google Sheets configuration" width="1108px" />

   - **Select spreadsheet** - browse for a spreadsheet that you own or that is shared with you.

   - **Select sheet** - choose a spreadsheet's sheet from which you want to pull the data.

   - **Range** - select a range of cells from which the data should be pulled.

   - **First row contains column headers** - enable this setting if you would like to use names defined in a header row as the name for object keys in a response.

1. Once finished with configuration click **SAVE** to commit your changes and return to the canvas.
