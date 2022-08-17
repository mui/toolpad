const ROUTES = {
  TOOLPAD_DOCS: '/toolpad/getting-started/setup',
  // https://docs.netlify.com/site-deploys/overview/#deploy-contexts
  TOOLPAD_SIGN_UP_URL:
    process.env.CONTEXT !== 'production' || process.env.NODE_ENV !== 'production'
      ? 'testing'
      : '/toolpad/sign-up',
};

export default ROUTES;
