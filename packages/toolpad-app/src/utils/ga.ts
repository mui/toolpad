import type { NextWebVitalsMetric } from 'next/app';
import config from '../config';
import { AppTemplateId } from '../types';

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

export const DEMO_CAMPAIGN_NAME = 'toolpad_demo';

export const addUTMParamsToUrl = (
  url: string,
  params: { source: string; medium: string; campaign: string },
): string => {
  const { source, medium, campaign } = params;

  const urlWithParams = new URL(url);

  urlWithParams.searchParams.set('utm_source', source);
  urlWithParams.searchParams.set('utm_medium', medium);
  urlWithParams.searchParams.set('utm_campaign', campaign);

  return urlWithParams.toString();
};

export const sendAppCreatedEvent = (appName: string, appTemplateId?: AppTemplateId): void => {
  if (config.gaId) {
    window.gtag('event', 'toolpad_app_created', {
      app_name: appName,
      app_template_id: appTemplateId,
    });
  }
};

export const sendAppContinueLatestEvent = (appId: string): void => {
  if (config.gaId) {
    window.gtag('event', 'toolpad_app_continue_latest', {
      app_id: appId,
    });
  }
};

export const sendSelfHostClickEvent = (appId?: string, source?: string): void => {
  if (config.gaId) {
    window.gtag('event', 'toolpad_self_host_click', {
      app_id: appId,
      source,
    });
  }
};

export const sendRoadmapClickEvent = (appId?: string): void => {
  if (config.gaId) {
    window.gtag('event', 'toolpad_roadmap_click', {
      app_id: appId,
    });
  }
};

export const sendScheduleDemoClickEvent = (appId?: string): void => {
  if (config.gaId) {
    window.gtag('event', 'toolpad_schedule_demo_click', {
      app_id: appId,
    });
  }
};
