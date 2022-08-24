const ROUTES = {
  toolpadDocs: '/toolpad/getting-started/setup',
  // https://docs.netlify.com/site-deploys/overview/#deploy-contexts
  TOOLPAD_SIGN_UP_URL:
    process.env.CONTEXT !== 'production' || process.env.NODE_ENV !== 'production'
      ? 'https://f0433e60.sibforms.com/serve/MUIEAC_Mm3SjecDuu_45huhRqqUS166FHh15psgNSmBZkXFSxEqRrUd5r__6BC0XkjnxnI9aE5VtmO5o3BODzXdwD04vC0uXK3MmcJ1eUAEPv5EdOtsHAXshvzE_F-fHN3DVT86dpiJI7ZjI28zOqrVBppsk2b0aGhP05bXTS8b0BxdQdJJHOdWSD7dB_Wx92aKmDzG8aadeU7oy'
      : 'https://f0433e60.sibforms.com/serve/MUIEAGFYDweUFQkPjnLIMSkBeIONRgiHjnai-Osxix4qSMaIbjoS_t3QNieqXAXxMn8daD3eHz-CrHTaZtPBOyIqUnczRpgsOc9Q34MSh5JGJUgwUhxFcsGoR_uxE_92m_YuFLsIxKktMt39HrbmJa0rDbFAP_E5aaJS9xR3p5_fj8BjdIPye4yfNnRY7TM_4SIv3j3LrQUJ_P52',
};

export default ROUTES;
