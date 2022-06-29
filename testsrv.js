const http = require('http');
const { movies } = require('./packages/toolpad-app/movies.json');

const srv = http.createServer((req, res) => {
  res.setHeader('content-type', 'application/json');
  res.write(JSON.stringify(movies));
  res.end();
});

srv.listen(3001);
