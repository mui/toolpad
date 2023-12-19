import { fromHar } from 'perf-cascade';
import * as React from 'react';
import type { Har } from 'har-format';
import { styled, SxProps } from '@mui/material';
import { useTheme, Theme } from '@mui/material/styles';
import { createHarLog } from '../utils/har';
import 'perf-cascade/dist/perf-cascade.css';

const HarViewerRoot = styled('div')({});

function fixLinks(elm: Element) {
  elm.querySelectorAll('a').forEach((link) => link.setAttribute('target', '_blank'));
}

function forceDarkMode(elm: Element, theme: Theme) {
  elm.querySelectorAll('svg').forEach((svg) => {
    svg.setAttribute('fill', 'white');
    if (svg.classList.contains('left-fixed-holder')) {
      const fullLabel = svg.getElementsByClassName('label-full-bg');
      if (fullLabel && fullLabel.length > 0) {
        (fullLabel[0] as SVGElement).style.fill = theme.palette.primaryDark[500];
      }
    }

    if (svg.classList.contains('tooltip-holder')) {
      const tooltips = svg.getElementsByClassName('tooltip-payload');
      if (tooltips && tooltips.length > 0) {
        for (const tooltip of tooltips) {
          (tooltip as HTMLDivElement).style.backgroundColor = theme.palette.primaryDark[500];
        }
      }
    }
  });
}

export interface HarViewerProps {
  value?: Har;
  sx?: SxProps;
}

export default function HarViewer({ value = createHarLog(), sx }: HarViewerProps) {
  const rootRef = React.useRef<HTMLDivElement>(null);
  const theme = useTheme();

  React.useEffect(() => {
    const root = rootRef.current;
    if (value && value.log.entries.length > 0 && root) {
      const svg = fromHar(value);
      fixLinks(svg);
      if (theme.palette.mode === 'dark') {
        forceDarkMode(svg, theme);
      }

      const observer = new MutationObserver((entries) => {
        for (const entry of entries) {
          for (const node of entry.addedNodes) {
            if (node instanceof Element) {
              fixLinks(node);
              if (theme.palette.mode === 'dark') {
                forceDarkMode(svg, theme);
              }
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
  }, [value, theme]);

  return <HarViewerRoot ref={rootRef} sx={sx} />;
}
