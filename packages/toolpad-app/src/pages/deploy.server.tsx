import type { GetServerSideProps } from 'next';
import { asArray } from '../utils/collections';
import { ToolpadAppProps } from '../runtime/ToolpadApp';
import { loadVersionedDom, findActiveDeployment } from '../server/data';

export const getServerSideProps: GetServerSideProps<ToolpadAppProps> = async (context) => {
  const [appId] = asArray(context.query.appId);

  if (!appId) {
    return {
      notFound: true,
    };
  }

  const activeDeployment = await findActiveDeployment(appId);

  if (!activeDeployment) {
    return {
      notFound: true,
    };
  }

  const { version } = activeDeployment;

  const dom = await loadVersionedDom(appId, version);

  return {
    props: {
      appId,
      dom,
      version,
      basename: `/deploy/${appId}`,
    },
  };
};
