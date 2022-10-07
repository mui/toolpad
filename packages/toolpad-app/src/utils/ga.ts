import type { NextWebVitalsMetric } from 'next/app';
import config from '../config';

export const GA_ID = config.gaId;

export const setGAPage = (pagePath: string): void => {
  if (GA_ID) {
    window.gtag('config', GA_ID, { page_path: pagePath });
  }
};

export const reportWebVitalsToGA = ({ id, label, name, value }: NextWebVitalsMetric): void => {
  if (GA_ID) {
    window.gtag('event', name, {
      event_category: label === 'web-vital' ? 'Web Vitals' : 'Next.js custom metric',
      value: Math.round(name === 'CLS' ? value * 1000 : value), // values must be integers
      event_label: id, // id unique to current page load
      non_interaction: true, // avoids affecting bounce rate.
    });
  }
};
