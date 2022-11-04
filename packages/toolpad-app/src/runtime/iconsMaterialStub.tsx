import * as React from 'react';

const cache = new Map();

export default new Proxy(
  {
    __esModule: true,
  },
  {
    get(target, prop: string) {
      let LazyIcon = cache.get(prop);

      if (!LazyIcon) {
        LazyIcon = React.lazy(async () => {
          const icons = await import('@mui/icons-material');
          const MuiIcon = (icons as any)[prop];
          if (!MuiIcon) {
            throw new Error(`Can't resolve "@mui/icons-material/${prop}"`);
          }
          return { default: MuiIcon };
        });
        cache.set(prop, LazyIcon);
      }

      return LazyIcon;
    },
  },
);
