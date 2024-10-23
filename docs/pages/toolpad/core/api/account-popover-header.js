import * as React from 'react';
import ApiPage from 'docs/src/modules/components/ApiPage';
import mapApiPageTranslations from 'docs/src/modules/utils/mapApiPageTranslations';
import jsonPageContent from './account-popover-header.json';

export default function Page(props) {
  const { descriptions, pageContent } = props;
  return <ApiPage descriptions={descriptions} pageContent={pageContent} />;
}

Page.getInitialProps = () => {
  const req = require.context(
    'docs-toolpad/translations/api-docs/account-popover-header',
    false,
    /\.\/account-popover-header.*.json$/,
  );
  const descriptions = mapApiPageTranslations(req);

  return {
    descriptions,
    pageContent: jsonPageContent,
  };
};
