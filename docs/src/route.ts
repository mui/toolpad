const ROUTES = {
  toolpadRepo: 'https://github.com/mui/mui-toolpad',
  toolpadQuickstart: '/toolpad/studio/getting-started/first-app/',
  toolpadDocs: '/toolpad/studio/getting-started/installation/',
  toolpadUpvote: 'https://github.com/mui/mui-toolpad/labels/waiting%20for%20%F0%9F%91%8D',
  toolpadBetaBlog: 'https://mui.com/blog/2023-toolpad-beta-announcement/',
  toolpadDemoBooking: 'https://calendly.com/prakhar-mui/toolpad',
  // https://docs.netlify.com/site-deploys/overview/#deploy-contexts
  TOOLPAD_SIGN_UP_URL:
    process.env.DEPLOY_ENV !== 'production'
      ? 'https://f0433e60.sibforms.com/serve/MUIEANZyAq3x75eMN1roZIpmPb4TE8EFhTZAvbUcFysXtDEaSpWoWwukcd26APxXYlq2qPzESe-CyKn52WqDgXIXUPiMd-8woOfv4ohmvQofRqFmkluZziib-OT4zdgZSMERv5osdP4HpbmOMEQ06hNHcEBKOVzBIUMJyZ9OFCjMMfg9cg_eRqVmarrsi0AZ1x4Hrt0dXSmuyCw1'
      : 'https://f0433e60.sibforms.com/serve/MUIEADGEjwspZFTdhelJvoqYipRwwszCE3d2K_wzbDDbLwVzsi_-xrh0yEItuylHQ7CCxE__clpeu8zG2X4CylBK1PPKFhI65Id51tGoiPnc_HEdyJtJOOXRyDTiMWFO9pXsA93tx2yCWkT6rGCS-uxh_2yJMNATGODr9buDsLN7R7R0cTjBMZoUzNy3l8CtuuX-PwSct9wuJvV0',
} as const;

export default ROUTES;
