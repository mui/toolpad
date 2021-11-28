import { NextApiHandler } from 'next';

export default (async (req, res) => {
  res.send(`
    <html>
      <head>
        <script type="importmap">
          {
            "imports": {
              "react": "https://esm.sh/react?dev",
              "react/jsx-runtime": "https://esm.sh/react/jsx-runtime?dev",
              "react-dom": "https://esm.sh/react-dom?dev",
              "@mui/material": "https://esm.sh/@mui/material?dev",
              "@mui/x-data-grid": "https://esm.sh/@mui/x-data-grid?dev"
            }
          }
        </script>
      </head>
      <body>
        <div id="root"></div>
        <script src="/sandbox/bootstrap.js" type="module"></script>
      </body>
    </html>
  `);
}) as NextApiHandler<string>;
