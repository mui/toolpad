# Custom components

<p class="description">When built-in components are not enough to achieve your wanted results build your own using custom components UI.</p>

## Creating new component

In order to create a new custom component locate **+** button in the Explorer near Components section and click it:

<img src="/static/toolpad/docs/building-ui/ui-10.png" width="253px" alt="Custom component" />

Choose the name for your component and click **Create**:

<img src="/static/toolpad/docs/building-ui/ui-11.png" width="434px" alt="Custom create" />

You can now use code editor (on the left) and live preview (on the right) to define your custom component:

<img src="/static/toolpad/docs/building-ui/ui-12.png" width="1243px" alt="Custom component IDE" />
<br />
<br />

Supported features:

- Expose props API through `argTypes` definition when using `createComponent` method.
- Import any external [ESM module](https://esm.sh/) through URL.
- Import anything from `@mui/*` packages:
  - [@mui/material](https://mui.com/material-ui/getting-started/overview/)
  - [@mui/x-data-grid](https://mui.com/x/react-data-grid/)
  - [@mui/x-date-pickers](https://mui.com/x/react-date-pickers/getting-started/)
  - [@mui/x-data-grid-pro](https://mui.com/x/api/data-grid/data-grid-pro/) (free of charge within Toolpad)
  - [@mui/x-date-pickers-pro](https://mui.com/x/react-date-pickers/getting-started/) (free of charge within Toolpad)
  - [@mui/icons-material](https://mui.com/material-ui/material-icons/)
