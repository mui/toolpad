import * as React from 'react';
import MarkdownDocs from 'docs/src/modules/components/MarkdownDocsV2';
import AppFrame from 'docs/src/modules/components/AppFrame';
import * as pageProps from 'docs-toolpad/data/toolpad/core/components/app-provider/core/app-provider.md?@mui/markdown';
import mapApiPageTranslations from 'docs/src/modules/utils/mapApiPageTranslations';
import AppProviderApiJsonPageContent from '../../api/app-provider.json';

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
  const AppProviderApiReq = require.context(
    'docs-toolpad/translations/api-docs/app-provider',
    false,
    /\.\/app-provider.*.json$/,
  );
  const AppProviderApiDescriptions = mapApiPageTranslations(AppProviderApiReq);

  return {
    props: {
      componentsApiDescriptions: { AppProvider: AppProviderApiDescriptions },
      componentsApiPageContents: { AppProvider: AppProviderApiJsonPageContent },
      hooksApiDescriptions: {},
      hooksApiPageContents: {},
    },
  };
};
