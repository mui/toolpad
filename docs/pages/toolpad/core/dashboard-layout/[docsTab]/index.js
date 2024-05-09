import * as React from 'react';
import MarkdownDocs from 'docs/src/modules/components/MarkdownDocsV2';
import AppFrame from 'docs/src/modules/components/AppFrame';
import * as pageProps from 'docs-toolpad/data/toolpad/core/components/dashboard-layout/core/dashboard-layout.md?@mui/markdown';
import mapApiPageTranslations from 'docs/src/modules/utils/mapApiPageTranslations';
import DashboardLayoutApiJsonPageContent from '../../api/dashboard-layout.json';

export default function Page(props) {
  const { userLanguage, ...other } = props;
  return <MarkdownDocs {...pageProps} {...other} />;
}

Page.getLayout = (page) => {
  return <AppFrame>{page}</AppFrame>;
};

export const getStaticPaths = () => {
  return {
    paths: [{ params: { docsTab: 'components-api' } }, { params: { docsTab: 'hooks-api' } }],
    fallback: false, // can also be true or 'blocking'
  };
};

export const getStaticProps = () => {
  const DashboardLayoutApiReq = require.context(
    'docs-toolpad/translations/api-docs/dashboard-layout',
    false,
    /\.\/dashboard-layout.*.json$/,
  );
  const DashboardLayoutApiDescriptions = mapApiPageTranslations(DashboardLayoutApiReq);

  return {
    props: {
      componentsApiDescriptions: { DashboardLayout: DashboardLayoutApiDescriptions },
      componentsApiPageContents: { DashboardLayout: DashboardLayoutApiJsonPageContent },
      hooksApiDescriptions: {},
      hooksApiPageContents: {},
    },
  };
};
