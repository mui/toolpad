import { fromHar } from 'perf-cascade';
import * as React from 'react';
import { Har } from 'har-format';
import { styled, SxProps } from '@mui/material';
import 'perf-cascade/dist/perf-cascade.css';

const HarViewerRoot = styled('div')({});

function fixLinks(elm: Element) {
  elm.querySelectorAll('a').forEach((link) => link.setAttribute('target', '_blank'));
}

export interface HarViewerProps {
  har?: Har;
  sx?: SxProps;
}

export default function HarViewer({ har, sx }: HarViewerProps) {
  const rootRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const root = rootRef.current;
    if (har && root) {
      const svg = fromHar(har);
      fixLinks(svg);

      const observer = new MutationObserver((entries) => {
        for (const entry of entries) {
          for (const node of entry.addedNodes) {
            if (node instanceof Element) {
              fixLinks(node);
            }
          }
        }
      });

      observer.observe(svg, {
        subtree: true,
        childList: true,
      });

      root.append(svg);
      return () => {
        observer.disconnect();
        svg.remove();
      };
    }
    return () => {};
  }, [har]);

  return <HarViewerRoot ref={rootRef} sx={sx} />;
}
