import { ToolpadComponent } from '@mui/toolpad-core';
import * as React from 'react';
import createCodeComponent from '../../../runtime/createCodeComponent';

export type UseCodeComponent =
  | {
      Component?: undefined;
      error?: undefined;
    }
  | {
      Component: ToolpadComponent;
      error?: undefined;
    }
  | {
      Component?: undefined;
      error: Error;
    };

export default function useCodeComponent(src: string | null): UseCodeComponent {
  const [state, setState] = React.useState<UseCodeComponent>({});

  React.useEffect(() => {
    if (!src) {
      return;
    }

    const startSrc = src;
    createCodeComponent(startSrc)
      .then((Component) => {
        if (startSrc === src) {
          setState({ Component });
        }
      })
      .catch((error: Error) => {
        if (startSrc === src) {
          setState({ error });
        }
      });
  }, [src]);

  return state;
}
