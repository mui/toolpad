import MyDocument from '@mui/monorepo/docs/pages/_document';

// eslint-disable-next-line no-console
console.log(
  process.env.PULL_REQUEST,
  typeof process.env.PULL_REQUEST,
  JSON.stringify(process.env.PULL_REQUEST),
);

export default MyDocument;
