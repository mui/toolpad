import { startTestServer } from '@toolpad/studio-tests/integration/rest-basic/testServer';

startTestServer(8080).then((server) => {
  // eslint-disable-next-line no-console
  console.log(`Server started at http://localhost:${server.port}`);
});
