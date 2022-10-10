import type { NextWebVitalsMetric } from 'next/app';
import config from '../config';

export const setGAPage = (pagePath: string): void => {
  if (config.gaId) {
    window.gtag('config', config.gaId, { page_path: pagePath });
  }
};

export const reportWebVitalsToGA = ({ id, label, name, value }: NextWebVitalsMetric): void => {
  if (config.gaId) {
    window.gtag('event', name, {
      event_category: label === 'web-vital' ? 'Web Vitals' : 'Next.js custom metric',
      value: Math.round(name === 'CLS' ? value * 1000 : value), // values must be integers
      event_label: id, // id unique to current page load
      non_interaction: true, // avoids affecting bounce rate.
    });
  }
};
